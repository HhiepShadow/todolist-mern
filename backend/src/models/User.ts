import mongoose from "mongoose";
import { UserDocument } from "../documents/UserDocument";
import { UserModel } from "../interfaces/UserModel";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<UserDocument, UserModel>("User", userSchema);
