import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { UserModel } from "../models/User";
import { signAccessToken } from "../lib/jwt";
import { HttpError } from "../lib/httpError";
import { requireAuth } from "../middleware/auth";

const registerSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(6).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

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

export const authRouter = Router();

authRouter.post("/register", async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    const existing = await UserModel.findOne({ email: body.email });
    if (existing) {
      next(new HttpError(409, "Email already registered"));
      return;
    }
    const passwordHash = await bcrypt.hash(body.password, 12);
    // For demo: if no admin exists yet, first registered user becomes admin.
    // Additionally, if email contains "admin", force role=admin (demo-only).
    const existingAdmin = await UserModel.exists({ role: "admin" });
    const wantsAdmin = body.email.toLowerCase().includes("admin");
    const role = wantsAdmin ? "admin" : existingAdmin ? "user" : "admin";
    const user = await UserModel.create({
      name: body.name,
      email: body.email,
      password: passwordHash,
      role,
    });
    const token = signAccessToken(String(user._id));
    res.status(201).json({
      token,
      user: toPublicUser(user),
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const user = await UserModel.findOne({ email: body.email }).select(
      "+password",
    );
    if (!user) {
      next(new HttpError(401, "Invalid email or password"));
      return;
    }
    if (user.status !== "active") {
      next(new HttpError(403, "Account is not active"));
      return;
    }
    const ok = await bcrypt.compare(body.password, user.password);
    if (!ok) {
      next(new HttpError(401, "Invalid email or password"));
      return;
    }
    const token = signAccessToken(String(user._id));
    res.json({
      token,
      user: toPublicUser({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }),
    });
  } catch (err) {
    next(err);
  }
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      next(new HttpError(401, "Unauthorized"));
      return;
    }
    const user = await UserModel.findById(userId);
    if (!user) {
      next(new HttpError(404, "User not found"));
      return;
    }
    res.json({ user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
});
