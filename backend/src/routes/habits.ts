import { Router } from "express";
import { z } from "zod";
import mongoose from "mongoose";

import { requireAuth } from "../middleware/auth";
import { HttpError } from "../lib/httpError";
import { HabitModel } from "../models/Habit";
import { HabitLogModel } from "../models/HabitLog";
import { isValidDateKey, utcDateKey } from "../lib/dateKey";
import { streakStatsForHabit } from "../lib/streak";

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

const checkInSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

const dateQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const logsQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export function toPublicHabit(doc: {
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

function toPublicLog(doc: {
  _id: unknown;
  habitId: unknown;
  userId: unknown;
  date: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    id: String(doc._id),
    habitId: String(doc.habitId),
    userId: String(doc.userId),
    date: doc.date,
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

async function findOwnedHabit(userId: string, habitId: string) {
  return HabitModel.findOne({
    _id: habitId,
    userId,
  });
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

// GET /api/habits/:id/logs
habitsRouter.get("/:id/logs", async (req, res, next) => {
  try {
    const userId = req.userId!;
    const habitId = objectIdSchema.parse(req.params.id);
    const q = logsQuerySchema.parse(req.query);

    const habit = await findOwnedHabit(userId, habitId);
    if (!habit) {
      next(new HttpError(404, "Habit not found"));
      return;
    }

    const filter: Record<string, unknown> = {
      habitId,
      userId,
    };
    if (q.from || q.to) {
      const dateCond: Record<string, string> = {};
      if (q.from) dateCond.$gte = q.from;
      if (q.to) dateCond.$lte = q.to;
      filter.date = dateCond;
    }

    const logs = await HabitLogModel.find(filter).sort({ date: -1 });
    res.json({ logs: logs.map(toPublicLog) });
  } catch (err) {
    next(err);
  }
});

// POST /api/habits/:id/check-in
habitsRouter.post("/:id/check-in", async (req, res, next) => {
  try {
    const userId = req.userId!;
    const habitId = objectIdSchema.parse(req.params.id);
    const body = checkInSchema.parse(req.body);

    const habit = await findOwnedHabit(userId, habitId);
    if (!habit) {
      next(new HttpError(404, "Habit not found"));
      return;
    }

    const dateKey = body.date ?? utcDateKey();
    if (!isValidDateKey(dateKey)) {
      next(new HttpError(400, "Invalid date"));
      return;
    }

    try {
      const log = await HabitLogModel.create({
        habitId,
        userId,
        date: dateKey,
        status: "completed",
      });
      res.status(201).json({ log: toPublicLog(log) });
    } catch (e: unknown) {
      if (
        e &&
        typeof e === "object" &&
        "code" in e &&
        (e as { code?: number }).code === 11000
      ) {
        next(new HttpError(409, "Already checked in for this date"));
        return;
      }
      throw e;
    }
  } catch (err) {
    next(err);
  }
});

// DELETE /api/habits/:id/check-in?date=YYYY-MM-DD
habitsRouter.delete("/:id/check-in", async (req, res, next) => {
  try {
    const userId = req.userId!;
    const habitId = objectIdSchema.parse(req.params.id);
    const q = dateQuerySchema.parse(req.query);

    const habit = await findOwnedHabit(userId, habitId);
    if (!habit) {
      next(new HttpError(404, "Habit not found"));
      return;
    }

    if (!isValidDateKey(q.date)) {
      next(new HttpError(400, "Invalid date"));
      return;
    }

    const deleted = await HabitLogModel.findOneAndDelete({
      habitId,
      userId,
      date: q.date,
    });

    if (!deleted) {
      next(new HttpError(404, "No check-in for this date"));
      return;
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// GET /api/habits/:id/streak
habitsRouter.get("/:id/streak", async (req, res, next) => {
  try {
    const userId = req.userId!;
    const habitId = objectIdSchema.parse(req.params.id);

    const habit = await findOwnedHabit(userId, habitId);
    if (!habit) {
      next(new HttpError(404, "Habit not found"));
      return;
    }

    const dates = await HabitLogModel.distinct("date", {
      habitId,
      userId,
    });
    const today = utcDateKey();
    const stats = streakStatsForHabit(dates as string[], today);

    res.json({
      habitId: String(habit._id),
      today,
      ...stats,
    });
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

    if (deleted) {
      await HabitLogModel.deleteMany({ habitId, userId });
    }

    if (!deleted) {
      next(new HttpError(404, "Habit not found"));
      return;
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

