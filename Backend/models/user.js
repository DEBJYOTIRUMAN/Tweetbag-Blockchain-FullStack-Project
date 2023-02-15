import mongoose from "mongoose";
const Schema = mongoose.Schema;
import { APP_URL } from "../config";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    walletAddress: { type: String, required: true },
    profileImage: {
      type: String,
      get: (profileImage) => {
        return `${APP_URL}/${profileImage.replace("\\", "/")}`;
      },
    },
    isProfileImageNft: { type: Boolean, required: true },
    coverImage: {
      type: String,
      get: (coverImage) => {
        return `${APP_URL}/${coverImage.replace("\\", "/")}`;
      },
    },
    role: { type: String, default: 'user' },
    followers: { type: Array, required: true },
    following: { type: Array, required: true },
  },
  { timestamps: true, toJSON: { getters: true }, id: false }
);

export default mongoose.model("User", userSchema, "users");
