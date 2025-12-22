import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";

// set userName
export const setUserName = asyncHandler(async (req, res) => {
  const wallet = req.user?.address;
  const { userName } = req.body;
  if (!wallet) throw new ApiError(400, "Wallet address is required");
  if (!userName) throw new ApiError(400, "Username is required");

  const user = await User.findOneAndUpdate(
    { walletAddress: wallet },
    { userName },
    { new: true }
  );

  if (!user) throw new ApiError(404, "User not found");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Username set successfully"));
});

//Find user by wallet address
export const getUserByWallet = asyncHandler(async (req, res) => {
  const { address } = req.params;
  if (!address) throw new ApiError(400, "Wallet required");

  const user = await User.findOne({ walletAddress: address });

  if (!user) throw new ApiError(404, "User not found");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User found"));
});
