const dateKeyRegex = /^\d{4}-\d{2}-\d{2}$/;

/** Calendar day as YYYY-MM-DD (UTC). */
export function utcDateKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function isValidDateKey(s: string): boolean {
  if (!dateKeyRegex.test(s)) return false;
  const [y, m, day] = s.split("-").map(Number);
  const dt = new Date(Date.UTC(y!, m! - 1, day!));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m! - 1 &&
    dt.getUTCDate() === day
  );
}
