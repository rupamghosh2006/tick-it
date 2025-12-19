import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Event } from "../models/event.models.js";
import { Ticket } from "../models/ticket.models.js";
import QRCode from "qrcode";
import nodemailer from "nodemailer";
import { User } from "../models/user.models.js";
import { buyTicketOnChain } from "../services/blockchain.service.js";


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

  // Step 3: Check duplicate ticket
  const existingTicket = await Ticket.findOne({
    eventId,
    participantAddress: wallet,
  });

  if (existingTicket) {
    throw new ApiError(400, "Ticket already purchased");
  }

  const txHash = await buyTicketOnChain({
    privateKey: process.env.PETRA_PRIVATE_KEY!, // or user's ephemeral key
    eventId: event.eventBlockchainId,
    price: event.ticketPrice * 100000000, // APT → Octas
    host: event.hostAddress,
    });



  // Step 4: Create ticket instance (not saved yet)
  const ticketDoc = new Ticket({
    eventId,
    participantAddress: wallet,
    valid: true,
    txHash,
  });

  // Step 4.1 Generate QR payload and image
  const qrData = `${ticketDoc._id}-${wallet}-${eventId}`;
  const qrImage = await QRCode.toDataURL(qrData);

  // Step 4.2 Save with QR
  ticketDoc.qrCode = qrImage;
  await ticketDoc.save();

  // Step 5: Increase soldSeats on event
  event.soldSeats += 1;
  await event.save();

  // Step 6: Fetch user email
  const user = await User.findOne({ walletAddress: wallet });

  if (user && user.email) {
    // Step 7: Send email with embedded QR
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif;">
        <h2>Your Ticket for <b>${event.eventName}</b></h2>
        <p>Hi,</p>
        <p>Thank you for purchasing a ticket for <b>${event.eventName}</b>.</p>
        <p><b>Mode:</b> ${event.mode}</p>
        <p><b>Price:</b> ${event.ticketPrice} APT (or equivalent)</p>
        <p><b>Wallet:</b> ${wallet}</p>
        <p>Please show the QR code below at the event entry:</p>
        <img src="${ticketDoc.qrCode}" alt="Ticket QR Code" style="margin-top: 10px; width: 200px; height: 200px;" />
        <p style="margin-top: 20px;">Keep this email safe. This QR is your proof of ticket ownership.</p>
        <p>– Aptos Ticketing System</p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Your Ticket for ${event.eventName}`,
      html: htmlContent,
      attachments: [
        {
            filename: "ticket-qr.png",
            content: qrImage.split("base64,")[1],  // remove prefix
            encoding: "base64",
            cid: "ticketqr"
         }
        ],
    });
  }

  return res
    .status(201)
    .json(new ApiResponse(201, {ticket: ticketDoc, txHash}, "Ticket purchased successfully"));
});


export const getMyTickets = asyncHandler(async (req, res) => {
  const wallet = req.user?.address;

  if (!wallet) {
    throw new ApiError(401, "Wallet authentication required");
  }

  const tickets = await Ticket.find({ participantAddress: wallet }).populate("eventId");

  return res
    .status(200)
    .json(new ApiResponse(200, tickets, "Tickets fetched"));
});
