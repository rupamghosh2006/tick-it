import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Event } from "../models/event.models.js";
import { Ticket } from "../models/ticket.models.js";
import QRCode from "qrcode";
import { User } from "../models/user.models.js";
import { buyTicketOnChain } from "../services/blockchain.service.js";
import { transporter } from "../utils/mailer.js";

// ====================== BUY TICKET ==========================
export const buyTicket = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const wallet = req.user?.address;

  if (!eventId) {
    throw new ApiError(400, "Event ID missing");
  }

  if (!wallet) {
    throw new ApiError(401, "Wallet authentication required");
  }

  // Step 1: Find event
  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  // Step 2: Check seat availability
  if (event.soldSeats >= event.maxSeats) {
    throw new ApiError(400, "No seats available");
  }

  // Step 3: Prevent duplicate ticket
  const existingTicket = await Ticket.findOne({
    eventId,
    participantAddress: wallet,
  });

  if (existingTicket) {
    throw new ApiError(400, "Ticket already purchased");
  }

  // Step 4: Buy ticket on blockchain
  const txHash = await buyTicketOnChain({
    privateKey: process.env.PETRA_PRIVATE_KEY!,
    eventId: event.eventBlockchainId,
    price: event.ticketPrice * 100000000, // APT → Octas
    host: event.hostAddress,
  });

  // Step 5: Create ticket (not saved yet)
  const ticketDoc = new Ticket({
    eventId,
    participantAddress: wallet,
    valid: true,
    txHash,
  });

  // Step 6: Generate QR
  const qrData = `${ticketDoc._id}-${wallet}-${eventId}`;
  const qrImage = await QRCode.toDataURL(qrData);

  ticketDoc.qrCode = qrImage;
  await ticketDoc.save();

  // Step 7: Update sold seats
  event.soldSeats += 1;
  await event.save();

  // Step 8: Fetch user email
  const user = await User.findOne({ walletAddress: wallet });

  // Step 9: Send ticket email
  if (user?.email) {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif;">
        <h2>Your Ticket for <b>${event.eventName}</b></h2>
        <p>Thank you for purchasing a ticket.</p>
        <p><b>Mode:</b> ${event.mode}</p>
        <p><b>Price:</b> ${event.ticketPrice} APT</p>
        <p><b>Wallet:</b> ${wallet}</p>
        <p>Please show this QR code at the event entry:</p>
        <img src="${ticketDoc.qrCode}" style="width:200px;height:200px;margin-top:10px;" />
        <p style="margin-top:20px;">
          Keep this email safe. This QR is your proof of entry.
        </p>
        <p>– Aptos Ticketing System</p>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: `Aptos Ticketing <${process.env.BREVO_FROM_EMAIL}>`,
        to: user.email,
        subject: `Your Ticket for ${event.eventName}`,
        html: htmlContent,
        attachments: [
          {
            filename: "ticket-qr.png",
            content: ticketDoc.qrCode.split("base64,")[1],
            encoding: "base64",
          },
        ],
      });
    } catch (error) {
      console.error("Ticket email failed:", error);
      // Do NOT fail purchase if email fails
    }
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      { ticket: ticketDoc, txHash },
      "Ticket purchased successfully"
    )
  );
});

// ====================== GET MY TICKETS ==========================
export const getMyTickets = asyncHandler(async (req, res) => {
  const wallet = req.user?.address;

  if (!wallet) {
    throw new ApiError(401, "Wallet authentication required");
  }

  const tickets = await Ticket.find({
    participantAddress: wallet,
  }).populate("eventId");

  return res
    .status(200)
    .json(new ApiResponse(200, tickets, "Tickets fetched"));
});
