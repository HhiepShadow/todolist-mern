import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { RequestWithUser } from "../interfaces/RequestWithUser";
import { User } from "../models/User";
import { generateAccessToken } from "../utils/generateAccessToken";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../utils/constants";

export const verifyToken = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).send({ msg: "Not authorized" });
    }
    const decoded = jwt.verify(token, ACCESS_TOKEN_KEY) as JwtPayload;

    if (!decoded) return res.status(401).json({ message: "Invalid token" });

    const user = await User.findById(decoded._id);
    if (!user) return res.status(401).json({ message: "Invalid token" });

    req.user = user;
    next();
  } catch (err) {
    console.log(err);
    if (err instanceof Error) {
      if (err.name === "TokenExpiredError") {
        const { refreshToken } = req.body || req.cookies;
        if (!refreshToken) {
          return res.status(401).send({ msg: "Not authorized" });
        }

        try {
          const decoded = jwt.verify(
            refreshToken,
            REFRESH_TOKEN_KEY
          ) as JwtPayload;

          const newAccessToken = generateAccessToken(decoded._id);

          res.setHeader("Authorization", `Bearer ${newAccessToken}`);
          req.user = jwt.decode(newAccessToken) as JwtPayload;
          next();
        } catch (error) {
          return res
            .status(403)
            .send({ msg: "Refresh token invalid or expired" });
        }
      } else {
        return res.status(403).send({ msg: "Invalid token" });
      }
    }
    return res.status(400).send({ err: err });
  }
};

export const refreshToken = (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(
      token as string,
      REFRESH_TOKEN_KEY
    ) as JwtPayload;

    const access_token = generateAccessToken(decoded._id);
    return res.status(200).send({ access_token });
  } catch (err) {
    res.status(403).json({ err: "Invalid token" });
  }
};
