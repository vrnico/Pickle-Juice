import { describe, it, expect } from "vitest";
import {
  dayRangeIso,
  last7DaysRangeIso,
  ratioForDay,
  ratioForLast7Days,
  sumSecondsByCategory,
} from "../aggregate";
import type { Session } from "../../db/types";

function session(overrides: Partial<Session>): Session {
  return {
    id: overrides.id ?? "id-" + Math.random(),
    category: overrides.category ?? "consume",
    startIso: overrides.startIso ?? "2026-04-14T12:00:00.000Z",
    endIso: overrides.endIso ?? "2026-04-14T12:30:00.000Z",
    durationSeconds: overrides.durationSeconds ?? 1800,
    createdAt: "2026-04-14T12:00:00.000Z",
    updatedAt: "2026-04-14T12:00:00.000Z",
    ...overrides,
  };
}

describe("sumSecondsByCategory", () => {
  it("returns zero totals for empty input", () => {
    expect(sumSecondsByCategory([])).toEqual({ consume: 0, create: 0 });
  });

  it("sums by category", () => {
    const totals = sumSecondsByCategory([
      session({ category: "consume", durationSeconds: 600 }),
      session({ category: "create", durationSeconds: 300 }),
      session({ category: "consume", durationSeconds: 60 }),
    ]);
    expect(totals).toEqual({ consume: 660, create: 300 });
  });
});

describe("dayRangeIso / last7DaysRangeIso", () => {
  it("dayRangeIso covers midnight to end of day", () => {
    const { startIso, endIso } = dayRangeIso(new Date("2026-04-14T15:00:00.000Z"));
    expect(startIso.endsWith("T00:00:00.000") || /T0[0-9]:00:00/.test(startIso)).toBe(
      true,
    );
    expect(endIso > startIso).toBe(true);
  });

  it("last7DaysRangeIso spans 7 days", () => {
    const { startIso, endIso } = last7DaysRangeIso(new Date("2026-04-14T12:00:00.000Z"));
    const days =
      (new Date(endIso).getTime() - new Date(startIso).getTime()) / 86_400_000;
    expect(days).toBeGreaterThanOrEqual(6.9);
    expect(days).toBeLessThanOrEqual(7.1);
  });
});

describe("ratioForDay", () => {
  it("returns a summary with consume / create / totalSeconds", () => {
    const today = new Date("2026-04-14T15:00:00.000Z");
    const sessions = [
      session({
        category: "consume",
        startIso: "2026-04-14T10:00:00.000Z",
        durationSeconds: 900,
      }),
      session({
        category: "create",
        startIso: "2026-04-14T11:00:00.000Z",
        durationSeconds: 1500,
      }),
      session({
        category: "consume",
        startIso: "2026-04-13T10:00:00.000Z",
        durationSeconds: 99999,
      }),
    ];
    const r = ratioForDay(sessions, today);
    expect(r).toEqual({ consume: 900, create: 1500, totalSeconds: 2400 });
  });
});

describe("ratioForLast7Days", () => {
  it("includes sessions inside the 7-day window", () => {
    const now = new Date("2026-04-14T15:00:00.000Z");
    const sessions = [
      session({
        category: "consume",
        startIso: "2026-04-10T10:00:00.000Z",
        durationSeconds: 300,
      }),
      session({
        category: "create",
        startIso: "2026-04-14T10:00:00.000Z",
        durationSeconds: 600,
      }),
      session({
        category: "create",
        startIso: "2026-04-01T10:00:00.000Z",
        durationSeconds: 99999,
      }),
    ];
    const r = ratioForLast7Days(sessions, now);
    expect(r).toEqual({ consume: 300, create: 600, totalSeconds: 900 });
  });
});
