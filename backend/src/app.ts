import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";

import { walletProtect } from "./middlewares/walletProtect.middleware.js";
import walletRoutes from "./routes/wallet.route.js";
import eventRoutes from "./routes/event.route.js";
import ticketRoutes from "./routes/ticket.route.js";  
import userRoutes from "./routes/user.route.js";
import { ApiResponse } from "./utils/ApiResponse.js";

// Extend Request type globally (JWT user injection)
declare global {
  namespace Express {
    interface Request {
      user?: {
        address: string;
      };
    }
  }
}

const app = express();

// Global middlewares
app.use(cors());
app.use(helmet());          // security headers
app.use(compression());     // gzip compression
app.use(express.json());    // parse JSON body
app.use(morgan("dev"));     // logs requests

// Route registration
app.use("/api/wallet", walletRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/user", userRoutes);

// Health check route
app.get("/", (_req, res) => {
  return res.status(200).json(new ApiResponse(200, "Aptos Ticketing Backend Live"));
});

// Protected example route
app.get("/api/protected", walletProtect, (req, res) => {
  return res.status(200).json(new ApiResponse(
    200,
    { wallet: req.user?.address },
    "JWT Verified"
  ));
});

export default app;