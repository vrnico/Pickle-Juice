import type { Category, Session } from "../db/types";

export interface RatioSummary {
  consume: number;
  create: number;
  totalSeconds: number;
}

export function sumSecondsByCategory(
  sessions: Session[],
): Record<Category, number> {
  const totals: Record<Category, number> = { consume: 0, create: 0 };
  for (const s of sessions) {
    totals[s.category] += s.durationSeconds;
  }
  return totals;
}

function startOfDayIso(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function endOfDayIso(date: Date): string {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

export function dayRangeIso(date: Date): { startIso: string; endIso: string } {
  return { startIso: startOfDayIso(date), endIso: endOfDayIso(date) };
}

export function last7DaysRangeIso(now: Date = new Date()): {
  startIso: string;
  endIso: string;
} {
  const end = endOfDayIso(now);
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - 6);
  return { startIso: startOfDayIso(startDate), endIso: end };
}

export function ratioForDay(sessions: Session[], date: Date): RatioSummary {
  const { startIso, endIso } = dayRangeIso(date);
  return toRatio(filterByRange(sessions, startIso, endIso));
}

export function ratioForLast7Days(
  sessions: Session[],
  now: Date = new Date(),
): RatioSummary {
  const { startIso, endIso } = last7DaysRangeIso(now);
  return toRatio(filterByRange(sessions, startIso, endIso));
}

function filterByRange(
  sessions: Session[],
  startIso: string,
  endIso: string,
): Session[] {
  return sessions.filter((s) => s.startIso >= startIso && s.startIso <= endIso);
}

function toRatio(sessions: Session[]): RatioSummary {
  const totals = sumSecondsByCategory(sessions);
  return {
    consume: totals.consume,
    create: totals.create,
    totalSeconds: totals.consume + totals.create,
  };
}
