import { Router } from "express";
import { walletProtect } from "../middlewares/walletProtect.middleware.js";
import { sendOTP, verifyOTP } from "../controllers/user.controller.js";

const router = Router();

// Send OTP to email (protected via wallet)
router.post("/send-otp", walletProtect, sendOTP);

// Verify OTP & create user account
router.post("/verify-otp", walletProtect, verifyOTP);

export default router;
