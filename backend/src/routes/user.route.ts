import { Router } from "express";
import { walletProtect } from "../middlewares/walletProtect.middleware.js";
import { getUserByWallet, sendOTP, setUserName, verifyOTP } from "../controllers/user.controller.js";

const router = Router();

// Send OTP to email (protected via wallet)
router.post("/send-otp", walletProtect, sendOTP);

// Verify OTP & create user account
router.post("/verify-otp", walletProtect, verifyOTP);

// Set username for user
router.post("/set-username", walletProtect, setUserName);

// Get user by wallet address
router.get("/:address", getUserByWallet);

export default router;
