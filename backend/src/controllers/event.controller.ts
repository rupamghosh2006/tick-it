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
    hostAddress: bodyHost,
  } = req.body;

  if (
    !eventName ||
    !eventDescription ||
    !mode ||
    !date ||
    !time ||
    ticketPrice === undefined ||
    !permission ||
    !maxSeats ||
    !eventBlockchainId
  ) {
    throw new ApiError(400, "All required event fields must be provided");
  }

  const hostAddress = req.user?.address || bodyHost;
  if (!hostAddress) {
    throw new ApiError(401, "Host address required");
  }

  if (!req.file) {
    throw new ApiError(400, "Event banner image is required");
  }

  const imageUrl = await uploadToPinata(req.file.path);
  fs.unlinkSync(req.file.path);

  const newEvent = await Event.create({
    hostAddress,
    eventName,
    eventDescription,
    mode,
    date,
    time,
    location,
    ticketPrice: Number(ticketPrice),
    permission,
    maxSeats: Number(maxSeats),
    eventBlockchainId, // ✅ STRING
    imageUrl,
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
