import { getEndedAuctions } from "../lib/getEndedAuction";
import { closeAuction } from "../lib/closeAuction";
import createError from "http-errors";

async function processAuction(event, context) {
  try {
    const auctionToClose = await getEndedAuctions();
    const closePromise = auctionToClose.map((auction) => closeAuction(auction));
    await Promise.all(closePromise);

    return { closed: closePromise.length };
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
}

export const handler = processAuction;
