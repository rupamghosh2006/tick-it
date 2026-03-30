import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { generateToken } from "../utils/generateToken.js";
import { Keypair } from '@stellar/stellar-sdk';
import { horizonServer, NETWORK_PASSPHRASE } from "../config/stellarClient.js";

const router = Router();

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { address } = req.body;

    if (!address) {
      throw new ApiError(400, "Wallet address required");
    }

    try {
      await horizonServer.loadAccount(address);
    } catch {
      throw new ApiError(400, "Invalid Stellar address");
    }

    const token = generateToken(address);

    return res
      .status(200)
      .json(new ApiResponse(200, { token, address }, "Wallet authenticated"));
  })
);

router.post(
  "/challenge",
  asyncHandler(async (req, res) => {
    const { publicKey } = req.body;

    if (!publicKey) {
      throw new ApiError(400, "Public key required");
    }

    const challengeXDR = `GAAAAA==`;

    return res
      .status(200)
      .json(new ApiResponse(200, { challengeXDR }, "Challenge generated"));
  })
);

router.post(
  "/verify",
  asyncHandler(async (req, res) => {
    const { signedXDR, publicKey } = req.body;

    if (!signedXDR || !publicKey) {
      throw new ApiError(400, "Signed XDR and public key required");
    }

    const token = generateToken(publicKey);

    return res
      .status(200)
      .json(new ApiResponse(200, { token, publicKey }, "Verification successful"));
  })
);

export default router;
