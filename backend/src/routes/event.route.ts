import { Router } from "express";
import { walletProtect } from "../middlewares/walletProtect.middleware.js";
import {
  createEvent,
  getAllEvents,
  getEventById
} from "../controllers/event.controller.js";

const router = Router();

// protected
router.post("/", walletProtect, createEvent);

// public
router.get("/", getAllEvents);
router.get("/:id", getEventById);

export default router;
