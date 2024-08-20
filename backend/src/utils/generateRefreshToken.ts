import jwt from "jsonwebtoken";
import { REFRESH_TOKEN_KEY } from "./constants";

export const generateRefreshToken = (_id: string) => {
  return jwt.sign({ _id }, REFRESH_TOKEN_KEY as string, { expiresIn: "12h" });
};
