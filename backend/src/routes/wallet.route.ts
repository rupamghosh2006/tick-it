import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { generateToken } from "../utils/generateToken.js";

const router = Router();

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { address } = req.body;

    if (!address) {
      throw new ApiError(400, "Wallet address required");
    }

    const token = generateToken(address);

    return res
      .status(200)
      .json(new ApiResponse(200, { token, address }, "Wallet authenticated"));
  })
);

export default router;
