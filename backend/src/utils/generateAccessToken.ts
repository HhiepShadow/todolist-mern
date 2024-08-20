import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_KEY } from "./constants";

export const generateAccessToken = (_id: string) => {
  return jwt.sign({ _id }, ACCESS_TOKEN_KEY as string, {
    expiresIn: "1m",
  });
};
