import { v4 as uuid } from "uuid";
import AWS from "aws-sdk";
import createError from "http-errors";
import validator from "@middy/validator";
import commonMiddleware from "../lib/commonMiddleware";
import createAuctionSchema from "../lib/schemas/createAuctionSchema";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function createAuction(event, context) {
  const { title } = event.body; // JSON.parse(event.body); is replace with httpJsonBodyParser() as middleware
  const { email } = event.requestContext.authorizer; // comes from authorizer
  const now = new Date();
  const endDate = new Date();
  endDate.setHours(now.getHours() + 1);

  const auction = {
    id: uuid(),
    title,
    status: "OPEN",
    createdAt: now.toISOString(),
    endingAt: endDate.toISOString(),
    highestBid: {
      amount: 0,
    },
    seller: email,
    pictureUrl: null,
  };

  try {
    let result = await dynamodb
      .put({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Item: auction,
      })
      .promise();
    console.table(auction);
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
  return {
    statusCode: 201,
    body: JSON.stringify(auction),
  };
}

export const handler = commonMiddleware(createAuction).use(
  validator({
    inputSchema: createAuctionSchema,
    ajvOptions: {
      strict: false,
    },
  })
);
