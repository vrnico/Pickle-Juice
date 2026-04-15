import { describe, it, expect } from "vitest";
import {
  INITIAL_PROGRESSION,
  addXp,
  checkBrokenStreak,
  evaluateStreak,
  levelForXp,
  progressToNextLevel,
  xpForLevel,
  xpForSession,
} from "../progression";
import { DEFAULT_PREFS, type Session } from "../../db/types";

function session(over: Partial<Session>): Session {
  return {
    id: "s",
    category: "create",
    startIso: "2026-04-14T12:00:00.000Z",
    endIso: "2026-04-14T12:10:00.000Z",
    durationSeconds: 600,
    createdAt: "x",
    updatedAt: "x",
    ...over,
  };
}

describe("levelForXp", () => {
  it("returns 1 at 0 XP", () => {
    expect(levelForXp(0)).toBe(1);
  });
  it("returns 2 at 100 XP", () => {
    expect(levelForXp(100)).toBe(2);
  });
  it("returns the right level for 1100 XP", () => {
    expect(levelForXp(1100)).toBe(5);
  });
});

describe("xpForLevel", () => {
  it("level 1 → 0", () => {
    expect(xpForLevel(1)).toBe(0);
  });
  it("level 2 → 100", () => {
    expect(xpForLevel(2)).toBe(100);
  });
});

describe("xpForSession", () => {
  it("Create at 3xp/min", () => {
    expect(xpForSession(session({ category: "create", durationSeconds: 600 }), DEFAULT_PREFS)).toBe(30);
  });
  it("Research at 2xp/min", () => {
    expect(
      xpForSession(
        session({ category: "consume", subtype: "research", durationSeconds: 600 }),
        DEFAULT_PREFS,
      ),
    ).toBe(20);
  });
  it("Leisure at 1xp/min", () => {
    expect(
      xpForSession(
        session({ category: "consume", subtype: "leisure", durationSeconds: 600 }),
        DEFAULT_PREFS,
      ),
    ).toBe(10);
  });
});

describe("addXp", () => {
  it("flags leveled-up when crossing a threshold", () => {
    const r = addXp({ ...INITIAL_PROGRESSION, xp: 90 }, 20);
    expect(r.leveledUp).toBe(true);
    expect(r.oldLevel).toBe(1);
    expect(r.newLevel).toBe(2);
  });
  it("does not flag when staying in same level", () => {
    const r = addXp({ ...INITIAL_PROGRESSION, xp: 110 }, 50);
    expect(r.leveledUp).toBe(false);
  });
});

describe("evaluateStreak", () => {
  it("starts streak at 1 on first qualifying day", () => {
    const next = evaluateStreak(INITIAL_PROGRESSION, "2026-04-14T12:00:00.000Z", 30, 10);
    expect(next.currentStreak).toBe(1);
  });

  it("extends streak on consecutive day", () => {
    const day1 = evaluateStreak(INITIAL_PROGRESSION, "2026-04-13T12:00:00.000Z", 30, 10);
    const day2 = evaluateStreak(day1, "2026-04-14T12:00:00.000Z", 30, 10);
    expect(day2.currentStreak).toBe(2);
    expect(day2.longestStreak).toBe(2);
  });

  it("resets to 1 when a day is skipped", () => {
    const day1 = evaluateStreak(INITIAL_PROGRESSION, "2026-04-12T12:00:00.000Z", 30, 10);
    const day3 = evaluateStreak(day1, "2026-04-14T12:00:00.000Z", 30, 10);
    expect(day3.currentStreak).toBe(1);
    expect(day3.longestStreak).toBe(1);
  });

  it("does not increment below threshold", () => {
    const next = evaluateStreak(INITIAL_PROGRESSION, "2026-04-14T12:00:00.000Z", 5, 10);
    expect(next.currentStreak).toBe(0);
  });
});

describe("checkBrokenStreak", () => {
  it("zeroes the streak when more than one day has passed", () => {
    const state = { ...INITIAL_PROGRESSION, currentStreak: 5, lastStreakDay: "2026-04-10" };
    const next = checkBrokenStreak(state, "2026-04-14T12:00:00.000Z");
    expect(next.currentStreak).toBe(0);
  });
  it("preserves a streak when last day was yesterday", () => {
    const state = { ...INITIAL_PROGRESSION, currentStreak: 5, lastStreakDay: "2026-04-13" };
    const next = checkBrokenStreak(state, "2026-04-14T12:00:00.000Z");
    expect(next.currentStreak).toBe(5);
  });
});

describe("progressToNextLevel", () => {
  it("returns the right span at level 1", () => {
    const p = progressToNextLevel(50);
    expect(p.level).toBe(1);
    expect(p.needed).toBe(100);
    expect(p.current).toBe(50);
    expect(p.pct).toBe(0.5);
  });
});
