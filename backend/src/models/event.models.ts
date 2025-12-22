import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    hostAddress: {
      type: String,
      required: true,
      index: true,
    },
    eventName: {
      type: String,
      required: true,
      index: "text",
    },
    eventDescription: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      enum: ["virtual", "in-person"],
      required: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    time: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      default: null,
    },
    ticketPrice: {
      type: Number,
      required: true,
    },
    permission: {
      type: String,
      enum: ["open", "approval"],
      required: true,
      default: "open",
      index: true,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    maxSeats: {
      type: Number,
      required: true,
    },
    soldSeats: {
      type: Number,
      default: 0,
    },

    eventBlockchainId: {
    type: String,
    required: true,
  },
  },
  { timestamps: true }
);

// compound & text search index
eventSchema.index({ eventName: "text", hostAddress: 1 });

export const Event = mongoose.model("Event", eventSchema);
