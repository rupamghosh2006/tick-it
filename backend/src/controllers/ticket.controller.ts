import QRCode from "qrcode";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Event } from "../models/event.models.js";
import { Ticket } from "../models/ticket.models.js";
import { User } from "../models/user.models.js";
import { buyTicketOnChain } from "../services/blockchain.service.js";

// ====================== BUY TICKET ======================
export const buyTicket = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const wallet = req.user?.address;

  if (!eventId) throw new ApiError(400, "Event ID is required");
  if (!wallet) throw new ApiError(401, "Wallet authentication required");

  // 1️⃣ Fetch event
  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(404, "Event not found");

  // 2️⃣ Seat availability
  if (event.soldSeats >= event.maxSeats) {
    throw new ApiError(400, "No seats available");
  }

  // 3️⃣ Duplicate ticket check
  const alreadyPurchased = await Ticket.findOne({
    eventId,
    participantAddress: wallet,
  });
  if (alreadyPurchased) {
    throw new ApiError(400, "Ticket already purchased");
  }

  // 4️⃣ Blockchain purchase
  const txHash = await buyTicketOnChain({
    privateKey: process.env.PETRA_PRIVATE_KEY!,
    eventId: event.eventBlockchainId,
    price: Number(event.ticketPrice) * 1e8, // APT → Octas
    host: event.hostAddress,
  });

  // 5️⃣ Create ticket (pre-save)
  const ticket = new Ticket({
    eventId,
    participantAddress: wallet,
    valid: true,
    txHash,
  });

  // 6️⃣ Generate QR
  const qrPayload = `${ticket._id}-${wallet}-${eventId}`;
  ticket.qrCode = await QRCode.toDataURL(qrPayload);

  await ticket.save();

  // 7️⃣ Update event seat count
  event.soldSeats += 1;
  await event.save();

  // 8️⃣ Optional: fetch user (email logic commented)
  await User.findOne({ walletAddress: wallet });

  return res.status(201).json(
    new ApiResponse(
      201,
      { ticket, txHash },
      "Ticket purchased successfully"
    )
  );
});

// ====================== GET MY TICKETS ======================
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
