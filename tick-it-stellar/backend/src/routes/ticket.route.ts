import { Router } from "express";
import { walletProtect } from "../middlewares/walletProtect.middleware.js";
import { buyTicket, getMyTickets } from "../controllers/ticket.controller.js";

const router = Router();

// protected
router.post("/buy/:eventId", walletProtect, buyTicket);
router.get("/my", walletProtect, getMyTickets);

export default router;
