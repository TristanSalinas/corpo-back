import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import type { User } from "../user/user.manager.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET ?? "";

export const generateToken = (payload: User) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "20min" });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET) as User;
  } catch (error) {
    return null;
  }
};
