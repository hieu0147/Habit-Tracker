import type { RequestHandler } from "express";

import { UserModel } from "../models/User";
import { HttpError } from "../lib/httpError";

export const requireAdmin: RequestHandler = async (req, _res, next) => {
  const userId = req.userId;
  if (!userId) {
    next(new HttpError(401, "Unauthorized"));
    return;
  }

  const user = await UserModel.findById(userId).select("role status");
  if (!user) {
    next(new HttpError(404, "User not found"));
    return;
  }
  if (user.status !== "active") {
    next(new HttpError(403, "Account is not active"));
    return;
  }
  if (user.role !== "admin") {
    next(new HttpError(403, "Forbidden"));
    return;
  }

  next();
};

