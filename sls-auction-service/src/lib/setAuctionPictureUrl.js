import AWS from "aws-sdk";
import createHttpError from "http-errors";

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function setAuctionPictureUrl(id, pictureUrl) {
  try {
    const params = {
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Key: { id },
      UpdateExpression: "set pictureUrl = :picture",
      ExpressionAttributeValues: {
        ":picture": pictureUrl,
      },
      ReturnValues: "ALL_NEW",
    };
    const result = await dynamodb.update(params).promise();

    return result.Attributes;
  } catch (error) {
    console.error(error);
    throw new createHttpError.InternalServerError(error);
  }
}
