import QRCode from "qrcode";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Event } from "../models/event.models.js";
import { Ticket } from "../models/ticket.models.js";
import { User } from "../models/user.models.js";
import { buyTicketOnChain, hasTicketForEvent } from "../services/blockchain.service.js";
import { Keypair } from '@stellar/stellar-sdk';

export const buyTicket = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const wallet = req.user?.address;

  if (!eventId) throw new ApiError(400, "Event ID is required");
  if (!wallet) throw new ApiError(401, "Wallet authentication required");

  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(404, "Event not found");

  if (event.soldSeats >= event.maxSeats) {
    throw new ApiError(400, "No seats available");
  }

  const alreadyPurchased = await Ticket.findOne({
    eventId,
    participantAddress: wallet,
  });
  if (alreadyPurchased) {
    throw new ApiError(400, "Ticket already purchased");
  }

  const privateKey = process.env.FREIGHTER_SECRET_KEY;
  if (!privateKey) {
    throw new ApiError(500, "Server wallet not configured");
  }

  const buyerKeypair = Keypair.fromSecret(privateKey);

  const { hash: txHash, ticketId } = await buyTicketOnChain({
    buyerKeypair,
    eventId: event.eventBlockchainId,
    price: Number(event.ticketPrice),
    host: event.hostAddress,
  });

  const ticket = new Ticket({
    eventId,
    participantAddress: wallet,
    valid: true,
    txHash,
    ticketId: ticketId.toString(),
  });

  const qrPayload = `${ticket._id}-${wallet}-${eventId}-${ticketId}`;
  ticket.qrCode = await QRCode.toDataURL(qrPayload);

  await ticket.save();

  event.soldSeats += 1;
  await event.save();

  await User.findOne({ walletAddress: wallet });

  return res.status(201).json(
    new ApiResponse(
      201,
      { ticket, txHash },
      "Ticket purchased successfully"
    )
  );
});

export const getMyTickets = asyncHandler(async (req, res) => {
  const wallet = req.user?.address;
  if (!wallet) throw new ApiError(401, "Wallet authentication required");

  const tickets = await Ticket.find({
    participantAddress: wallet,
  }).populate("eventId");

  return res
    .status(200)
    .json(new ApiResponse(200, tickets, "Tickets fetched"));
});
