import { Router } from "express";
import { z } from "zod";
import mongoose from "mongoose";

import { requireAuth } from "../middleware/auth";
import { requireAdmin } from "../middleware/requireAdmin";
import { HttpError } from "../lib/httpError";
import { UserModel } from "../models/User";

const objectIdSchema = z
  .string()
  .refine((v) => mongoose.Types.ObjectId.isValid(v), "Invalid id");

const statusSchema = z.enum(["active", "blocked"]);

function toPublicUser(doc: {
  _id: unknown;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    id: String(doc._id),
    name: doc.name,
    email: doc.email,
    role: doc.role,
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export const adminRouter = Router();

adminRouter.use(requireAuth);
adminRouter.use(requireAdmin);

// GET /api/admin/users
adminRouter.get("/users", async (_req, res, next) => {
  try {
    const users = await UserModel.find({})
      .select("name email role status createdAt updatedAt")
      .sort({ createdAt: -1 });
    res.json({ users: users.map(toPublicUser) });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/users/:id/status
adminRouter.put(
  "/users/:id/status",
  async (req, res, next) => {
    try {
      const userId = objectIdSchema.parse(req.params.id);
      const body = z
        .object({ status: statusSchema })
        .parse(req.body);

      const target = await UserModel.findById(userId);
      if (!target) {
        next(new HttpError(404, "User not found"));
        return;
      }

      target.status = body.status;
      await target.save();

      res.json({ user: toPublicUser(target) });
    } catch (err) {
      next(err);
    }
  },
);

