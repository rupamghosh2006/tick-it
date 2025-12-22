import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  userName?: string;
  walletAddress: string;
  // email: string;
  // isVerified: boolean;
}

const userSchema = new Schema<IUser>(
  {
    userName: {
      type: String,
    },
    walletAddress: {
      type: String,
      required: [true, "Wallet address is required"],
      unique: true,
      index: true,
    },
    // email: {
    //   type: String,
    //   required: [true, "Email is required"],
    //   unique: true,
    //   index: true,
    //   match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    // },
    // isVerified: {
    //   type: Boolean,
    //   default: false,
    // },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);
