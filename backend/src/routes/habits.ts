import { Router } from "express";
import { z } from "zod";
import mongoose from "mongoose";

import { requireAuth } from "../middleware/auth";
import { HttpError } from "../lib/httpError";
import { HabitModel } from "../models/Habit";

const objectIdSchema = z
  .string()
  .refine((v) => mongoose.Types.ObjectId.isValid(v), "Invalid id");

const createHabitSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  startDate: z.coerce.date().optional(),
  isActive: z.boolean().optional(),
  color: z.string().max(32).optional(),
  targetPerDay: z.coerce.number().int().min(1).max(100).optional(),
});

const updateHabitSchema = createHabitSchema.partial().refine(
  (obj) => Object.keys(obj).length > 0,
  { message: "At least one field is required" },
);

function toPublicHabit(doc: {
  _id: unknown;
  userId: unknown;
  title: string;
  description?: string;
  startDate?: Date;
  isActive: boolean;
  color?: string;
  targetPerDay?: number;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    id: String(doc._id),
    userId: String(doc.userId),
    title: doc.title,
    description: doc.description ?? "",
    startDate: doc.startDate,
    isActive: doc.isActive,
    color: doc.color ?? "",
    targetPerDay: doc.targetPerDay ?? 1,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export const habitsRouter = Router();

habitsRouter.use(requireAuth);

// GET /api/habits
habitsRouter.get("/", async (req, res, next) => {
  try {
    const userId = req.userId!;
    const habits = await HabitModel.find({ userId }).sort({ createdAt: -1 });
    res.json({ habits: habits.map(toPublicHabit) });
  } catch (err) {
    next(err);
  }
});

// POST /api/habits
habitsRouter.post("/", async (req, res, next) => {
  try {
    const userId = req.userId!;
    const body = createHabitSchema.parse(req.body);
    const habit = await HabitModel.create({
      userId,
      title: body.title,
      description: body.description ?? "",
      startDate: body.startDate ?? new Date(),
      isActive: body.isActive ?? true,
      color: body.color ?? "",
      targetPerDay: body.targetPerDay ?? 1,
    });
    res.status(201).json({ habit: toPublicHabit(habit) });
  } catch (err) {
    next(err);
  }
});

// PUT /api/habits/:id
habitsRouter.put("/:id", async (req, res, next) => {
  try {
    const userId = req.userId!;
    const habitId = objectIdSchema.parse(req.params.id);
    const body = updateHabitSchema.parse(req.body);

    const habit = await HabitModel.findOne({ _id: habitId, userId });
    if (!habit) {
      next(new HttpError(404, "Habit not found"));
      return;
    }

    if (body.title !== undefined) habit.title = body.title;
    if (body.description !== undefined) habit.description = body.description;
    if (body.startDate !== undefined) habit.startDate = body.startDate;
    if (body.isActive !== undefined) habit.isActive = body.isActive;
    if (body.color !== undefined) habit.color = body.color;
    if (body.targetPerDay !== undefined) habit.targetPerDay = body.targetPerDay;

    await habit.save();
    res.json({ habit: toPublicHabit(habit) });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/habits/:id
habitsRouter.delete("/:id", async (req, res, next) => {
  try {
    const userId = req.userId!;
    const habitId = objectIdSchema.parse(req.params.id);

    const deleted = await HabitModel.findOneAndDelete({
      _id: habitId,
      userId,
    });

    if (!deleted) {
      next(new HttpError(404, "Habit not found"));
      return;
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

