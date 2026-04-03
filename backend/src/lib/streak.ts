import { addUtcDays } from "./dateKey";

function dayDiffUtc(a: string, b: string): number {
  const ta = new Date(`${a}T00:00:00.000Z`).getTime();
  const tb = new Date(`${b}T00:00:00.000Z`).getTime();
  return Math.round((tb - ta) / 86_400_000);
}

/** `sortedAsc` must be unique YYYY-MM-DD strings sorted ascending. */
export function longestStreak(sortedAsc: string[]): number {
  if (sortedAsc.length === 0) return 0;
  let best = 1;
  let run = 1;
  for (let i = 1; i < sortedAsc.length; i++) {
    const prev = sortedAsc[i - 1]!;
    const cur = sortedAsc[i]!;
    if (dayDiffUtc(prev, cur) === 1) run++;
    else run = 1;
    if (run > best) best = run;
  }
  return best;
}

/** Consecutive completed days ending at `today` (UTC), walking backward. */
export function currentStreakFromToday(
  dateSet: Set<string>,
  today: string,
): number {
  let count = 0;
  let d = today;
  while (dateSet.has(d)) {
    count++;
    d = addUtcDays(d, -1);
  }
  return count;
}

/** Share of days in `[endDay - (windowDays-1), endDay]` (UTC) that appear in `dateSet`. */
export function completionRateRolling(
  dateSet: Set<string>,
  endDay: string,
  windowDays: number,
): number {
  if (windowDays <= 0) return 0;
  let done = 0;
  let d = endDay;
  for (let i = 0; i < windowDays; i++) {
    if (dateSet.has(d)) done++;
    d = addUtcDays(d, -1);
  }
  return done / windowDays;
}

/** Unique YYYY-MM-DD list, sorted ascending. */
export function streakStatsForHabit(dates: string[], today: string) {
  const unique = [...new Set(dates)].sort();
  const set = new Set(unique);
  return {
    currentStreak: currentStreakFromToday(set, today),
    longestStreak: longestStreak(unique),
    totalCompletedDays: unique.length,
    weeklyCompletionRate: completionRateRolling(set, today, 7),
    monthlyCompletionRate: completionRateRolling(set, today, 30),
  };
}
