import type { RequestHandler } from "express";
import { HttpError } from "../lib/httpError";
import { verifyAccessToken } from "../lib/jwt";

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(new HttpError(401, "Unauthorized"));
    return;
  }
  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    next(new HttpError(401, "Unauthorized"));
    return;
  }
  try {
    const { sub } = verifyAccessToken(token);
    req.userId = sub;
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired token"));
  }
};
