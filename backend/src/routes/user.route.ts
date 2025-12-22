import { Router } from "express";
import { walletProtect } from "../middlewares/walletProtect.middleware.js";
import { getUserByWallet, setUserName } from "../controllers/user.controller.js";

const router = Router();

// Set username for user
router.post("/set-username", walletProtect, setUserName);

// Get user by wallet address
router.get("/:address", getUserByWallet);

export default router;
