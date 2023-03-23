import AWS from "aws-sdk";
import createError from "http-errors";
import validator from "@middy/validator";
import { getAuctionById } from "./getAuction";
import commonMiddleware from "../lib/commonMiddleware";
import placeBidSchema from "../lib/schemas/placeBidSchema";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
  const { id } = event.pathParameters;
  const { amount } = event.body;
  const { email } = event.requestContext.authorizer; // comes from authorizer

  const auction = await getAuctionById(id);

  //Bid identity validation
  if (auction.seller === email) {
    throw new createError.Forbidden(`Your cannot bid on your own auctions!`);
  }

  //  Avoid double biding
  if (auction.highestBid.bidder === email) {
    throw new createError.Forbidden(`Your are already the highest bidder`);
  }

  // Auction status validation
  if (auction.status !== "OPEN") {
    throw new createError.Forbidden(`Your cannot bid on closed auctions!`);
  }

  // Bid Amount Validation
  if (amount <= auction.highestBid.amount) {
    throw new createError.Forbidden(
      `Your bid must be higher than ${auction.highestBid.amount}!`
    );
  }

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression:
      "set highestBid.amount = :amount, highestBid.bidder = :bidder",
    ExpressionAttributeValues: {
      ":amount": amount,
      ":bidder": email,
    },
    ReturnValues: "ALL_NEW",
  };

  let updateAuction;

  try {
    const result = await dynamodb.update(params).promise();

    updateAuction = result.Attributes;
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updateAuction),
  };
}

export const handler = commonMiddleware(placeBid).use(
  validator({
    inputSchema: placeBidSchema,
    ajvOptions: {
      strict: false,
    },
  })
);
