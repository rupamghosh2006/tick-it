import mongoose, { Schema, Document } from "mongoose";

export interface IOtp extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
}

const otpSchema = new Schema<IOtp>({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: '5m' } // auto delete after 5 minutes
  }
});

export const Otp = mongoose.model<IOtp>("Otp", otpSchema);
