import { Router } from "express";
import mongoose from "mongoose";

import { requireAuth } from "../middleware/auth";
import { addUtcDays, utcDateKey } from "../lib/dateKey";
import { streakStatsForHabit } from "../lib/streak";
import { HabitModel } from "../models/Habit";
import { HabitLogModel } from "../models/HabitLog";
import { toPublicHabit } from "./habits";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

// GET /api/dashboard
dashboardRouter.get("/", async (req, res, next) => {
  try {
    const userId = req.userId!;
    const oid = new mongoose.Types.ObjectId(userId);
    const today = utcDateKey();
    const yesterday = addUtcDays(today, -1);

    const habits = await HabitModel.find({ userId, isActive: true }).sort({
      createdAt: -1,
    });

    if (habits.length === 0) {
      res.json({
        today,
        totalHabits: 0,
        completedToday: 0,
        habits: [],
        atRisk: [],
      });
      return;
    }

    const habitIds = habits.map((h) => h._id);

    const grouped = await HabitLogModel.aggregate<{
      _id: mongoose.Types.ObjectId;
      dates: string[];
    }>([
      { $match: { userId: oid, habitId: { $in: habitIds } } },
      { $group: { _id: "$habitId", dates: { $addToSet: "$date" } } },
    ]);

    const datesByHabit = new Map<string, string[]>();
    for (const row of grouped) {
      datesByHabit.set(String(row._id), row.dates);
    }

    const habitRows: Array<{
      habit: ReturnType<typeof toPublicHabit>;
      completedToday: boolean;
    } & ReturnType<typeof streakStatsForHabit>> = [];
    const atRisk: Array<{
      habit: ReturnType<typeof toPublicHabit>;
      currentStreak: number;
    }> = [];

    for (const h of habits) {
      const id = String(h._id);
      const dates = datesByHabit.get(id) ?? [];
      const stats = streakStatsForHabit(dates, today);
      const completedToday = dates.includes(today);
      habitRows.push({
        habit: toPublicHabit(h),
        ...stats,
        completedToday,
      });

      const set = new Set(dates);
      if (set.has(yesterday) && !set.has(today)) {
        atRisk.push({
          habit: toPublicHabit(h),
          currentStreak: stats.currentStreak,
        });
      }
    }

    const completedToday = habitRows.filter((r) => r.completedToday).length;

    res.json({
      today,
      totalHabits: habits.length,
      completedToday,
      habits: habitRows,
      atRisk,
    });
  } catch (err) {
    next(err);
  }
});
