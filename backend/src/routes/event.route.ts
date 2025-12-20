import { Router } from "express";
import { walletProtect } from "../middlewares/walletProtect.middleware.js";
import {
  createEvent,
  getAllEvents,
  getEventById,
} from "../controllers/event.controller.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

// protected → create event with banner upload
router.post(
  "/",
  walletProtect,
  upload.single("banner"), 
  createEvent
);

// public
router.get("/", getAllEvents);
router.get("/:id", getEventById);

export default router;
