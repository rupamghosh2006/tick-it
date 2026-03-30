import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

export interface AuthRequest extends Request {
  user?: { address: string };
}

export const walletProtect = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Authorization token missing");
  }

  const token = authHeader.split(" ")[1];

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new ApiError(500, "JWT_SECRET is not configured");
    }
    const decoded = jwt.verify(token as string, jwtSecret as string) as unknown as { address: string };
    req.user = { address: decoded.address };
    next();
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token");
  }
};
