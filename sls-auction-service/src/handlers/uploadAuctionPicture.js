import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import validator from "@middy/validator";
import createHttpError from "http-errors";
import { setAuctionPictureUrl } from "../lib/setAuctionPictureUrl";
import { uploadPictureToS3 } from "../lib/uploadPictureToS3";
import uploadAuctionPictureSchema from "../lib/schemas/uploadAuctionPictureSchema";
import { getAuctionById } from "./getAuction";

export async function uploadAuctionPicture(event) {
  const { id } = event.pathParameters;
  const { email } = event.requestContext.authorizer;
  const auction = await getAuctionById(id);
  const base64 = event.body.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64, "base64");
  let updateAuction;

  if (!isBase64(base64)) {
    throw new createHttpError.Forbidden(`Not base64`);
  }

  //   Validate auction ownership
  if (auction.seller !== email) {
    throw new createHttpError.Forbidden(`Your cannot upload picture!`);
  }

  try {
    const pictureUrl = await uploadPictureToS3(auction.id + ".jpg", buffer);
    console.log("test", pictureUrl);
    updateAuction = await setAuctionPictureUrl(auction.id, pictureUrl);
    // return pictureUrl;
  } catch (error) {
    console.error(error);
    throw new createHttpError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updateAuction),
  };
}

// function isBase64(str) {
//   console.log("str", str, "decoded1", decoded1, "encoded2", encoded2);
//   var decoded1 = Buffer.from(str, "base64").toString("utf8");
//   var encoded2 = Buffer.from(decoded1, "binary").toString("base64");
//   return str == encoded2;
// }

export const handler = middy(uploadAuctionPicture)
  .use(httpErrorHandler())
  .use(
    validator({
      inputSchema: uploadAuctionPictureSchema,
      ajvOptions: {
        strict: false,
      },
    })
  );
