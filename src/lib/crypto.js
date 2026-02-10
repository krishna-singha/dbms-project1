import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 12;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export const hashPassword = (password) =>
  bcrypt.hash(password, SALT_ROUNDS);

export const verifyPassword = (password, hash) =>
  bcrypt.compare(password, hash);

export const generateToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: "HS256",
  });

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });
  } catch {
    return null;
  }
};