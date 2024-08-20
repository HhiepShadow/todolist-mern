import { Model } from "mongoose";
import { UserDocument } from "../documents/UserDocument";

export interface UserModel extends Model<UserDocument> {}
