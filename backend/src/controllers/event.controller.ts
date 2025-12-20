import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Event } from "../models/event.models.js";
import { uploadToPinata } from "../utils/pinata.js";
import fs from "fs";

export const createEvent = asyncHandler(async (req, res) => {
  const {
    eventName,
    eventDescription,
    mode,
    date,
    time,
    location,
    ticketPrice,
    permission,
    maxSeats,
    eventBlockchainId,
  } = req.body;

  // 🔒 basic validation
  if (
    !eventName ||
    !eventDescription ||
    !mode ||
    !date ||
    !time ||
    !ticketPrice ||
    !permission ||
    !maxSeats ||
    !eventBlockchainId
  ) {
    throw new ApiError(400, "All required event fields must be provided");
  }

  if (!req.user?.address) {
    throw new ApiError(401, "User address is required to create an event");
  }

  // 🖼 banner image required
  if (!req.file) {
    throw new ApiError(400, "Event banner image is required");
  }

  // ⬆️ Upload banner to Pinata (IPFS)
  const imageUrl = await uploadToPinata(req.file.path);

  // 🧹 delete local file after upload
  fs.unlinkSync(req.file.path);

  const newEvent = await Event.create({
    hostAddress: req.user.address,
    eventName,
    eventDescription,
    mode,
    date,
    time,
    location,
    ticketPrice: Number(ticketPrice),
    permission,
    maxSeats: Number(maxSeats),
    eventBlockchainId: Number(eventBlockchainId),
    imageUrl, // ✅ IPFS URL
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newEvent, "Event created successfully"));
});

export const getAllEvents = asyncHandler(async (_req, res) => {
  const events = await Event.find().sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, events, "Events fetched"));
});

export const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  return res.status(200).json(new ApiResponse(200, event, "Event fetched"));
});
