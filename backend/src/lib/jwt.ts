import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "./env";

export type JwtPayload = {
  sub: string;
};

export function signAccessToken(userId: string): string {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };
  return jwt.sign({ sub: userId }, env.JWT_SECRET, options);
}

export function verifyAccessToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (typeof decoded !== "object" || decoded === null || !("sub" in decoded)) {
    throw new Error("Invalid token payload");
  }
  const sub = (decoded as { sub?: unknown }).sub;
  if (typeof sub !== "string" || sub.length === 0) {
    throw new Error("Invalid token payload");
  }
  return { sub };
}
