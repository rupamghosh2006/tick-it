import mongoose, { Schema, Document } from "mongoose";

export interface ITicket extends Document {
  eventId: mongoose.Types.ObjectId;
  participantAddress: string;
  valid: boolean;
  qrCode: string;
}

const ticketSchema = new Schema<ITicket>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    participantAddress: {
      type: String,
      required: true,
      index: true,
    },
    valid: {
      type: Boolean,
      default: true,
    },
    qrCode: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// compound optimization
ticketSchema.index({ eventId: 1, participantAddress: 1 });

export const Ticket = mongoose.model<ITicket>("Ticket", ticketSchema);
