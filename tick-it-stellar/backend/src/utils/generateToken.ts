import jwt from "jsonwebtoken";

export const generateToken = (address: string) => {
  return jwt.sign({ address }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
};
