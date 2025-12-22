import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { Otp } from "../models/otp.models.js";
import nodemailer from "nodemailer";
import crypto from "crypto";

// ====================== SEND OTP ==========================
export const sendOTP = asyncHandler(async (req, res) => {
  const wallet = req.user?.address;
  const { email} = req.body;

  if (!email) throw new ApiError(400, "Email is required");
  if (!wallet) throw new ApiError(400, "Wallet address is required");

  // Check if wallet or email already registered
  const existing = await User.findOne({
    $or: [{ walletAddress: wallet }, { email }]
  });

  if (existing) {
    throw new ApiError(400, "User already exists!");
  }

  // generate 6 digit otp
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = crypto.createHash("sha256").update(otpCode).digest("hex");

  // store OTP temporarily
  await Otp.create({
    email,
    otp: hashedOtp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 mins expiry
  });

  // Mail setup
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "OTP for Aptos Ticketing Verification",
    html: `<h2>Your OTP: <b>${otpCode}</b></h2><p>Valid for 5 minutes</p>`
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "OTP sent successfully"));
});


// ====================== VERIFY OTP ==========================
export const verifyOTP = asyncHandler(async (req, res) => {
  const wallet = req.user?.address;
  const { email, otp } = req.body;

  if (!email || !otp) throw new ApiError(400, "Email and OTP are required");
  if (!wallet) throw new ApiError(400, "Wallet address is required");

  const otpRecord = await Otp.findOne({ email });
  if (!otpRecord) throw new ApiError(400, "OTP expired or invalid");

  const hashedInput = crypto.createHash("sha256").update(otp).digest("hex");
  if (hashedInput !== otpRecord.otp) throw new ApiError(400, "Incorrect OTP");

  // OTP verified → create user account
  const user = await User.create({
    walletAddress: wallet,
    email,
    isVerified: true,
  });

  // Remove used OTP
  await otpRecord.deleteOne();

  return res
    .status(201)
    .json(new ApiResponse(201, user, "Account created successfully"));
});

// set userName
export const setUserName = asyncHandler(async (req, res) => {
  const wallet = req.user?.address;
  const { userName } = req.body;
  if (!wallet) throw new ApiError(400, "Wallet address is required");
  if (!userName) throw new ApiError(400, "Username is required");

  const user = await User.findOneAndUpdate(
    { walletAddress: wallet },
    { userName },
    { new: true }
  );

  if (!user) throw new ApiError(404, "User not found");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Username set successfully"));
});

//Find user by wallet address
export const getUserByWallet = asyncHandler(async (req, res) => {
  const { address } = req.params;
  if (!address) throw new ApiError(400, "Wallet required");

  const user = await User.findOne({ walletAddress: address });

  if (!user) throw new ApiError(404, "User not found");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User found"));
});
