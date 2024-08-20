import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../models/User";
import { generateAccessToken } from "../utils/generateAccessToken";
import { generateRefreshToken } from "../utils/generateRefreshToken";
import { RequestWithUser } from "../interfaces/RequestWithUser";
import { ACCESS_TOKEN_KEY } from "../utils/constants";
import redisClient from "../utils/redis";

const getUser = async (req: RequestWithUser, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ msg: "Unauthorized" });
  }

  res.status(200).json({
    _id: user._id,
    username: user.username,
    email: user.email,
  });
};

const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username: username,
      email: email,
      password: hashedPassword,
    });

    await newUser.save();

    return res.status(200).send("New user has been created");
  } catch (err) {
    return res.status(400).send({ err: err });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(401).send({ msg: "Wrong user or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(404).send({ msg: "Wrong user or password" });
    }

    const accessToken = generateAccessToken(user._id.toString());
    const refreshedToken = generateRefreshToken(user._id.toString());

    // Save refresh token into Redis:
    await redisClient.set(`refreshToken:${user._id}`, refreshedToken, {
      EX: 60 * 60 * 24,
    });

    return res.status(200).send({
      _id: user._id,
      username: user.username,
      email: user.email,
      accessToken: accessToken,
      refreshedToken: refreshedToken,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ err: err });
  }
};

const logout = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(400).json({ message: "No token provided" });

    const decoded = jwt.verify(token as string, ACCESS_TOKEN_KEY) as JwtPayload;
    if (!decoded) return res.status(401).json({ message: "Invalid token" });

    await redisClient.del(`refreshToken:${decoded._id}`);

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export { getUser, register, login, logout };
