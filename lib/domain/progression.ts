import type { Prefs, ProgressionState, Session } from "../db/types";

export const LEVEL_THRESHOLDS: number[] = [
  0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500,
];

export function levelForXp(xp: number): number {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return level;
}

export function xpForLevel(level: number): number {
  return LEVEL_THRESHOLDS[Math.max(0, level - 1)] ?? Infinity;
}

export function xpForSession(s: Session, prefs: Prefs): number {
  const minutes = s.durationSeconds / 60;
  if (s.category === "create") return Math.round(minutes * prefs.createXp);
  if (s.category === "consume" && s.subtype === "research") {
    return Math.round(minutes * prefs.researchXp);
  }
  return Math.round(minutes * prefs.leisureXp);
}

export interface AddXpResult {
  newState: ProgressionState;
  leveledUp: boolean;
  oldLevel: number;
  newLevel: number;
}

export function addXp(state: ProgressionState, amount: number): AddXpResult {
  const oldLevel = levelForXp(state.xp);
  const newXp = state.xp + amount;
  const newLevel = levelForXp(newXp);
  return {
    newState: { ...state, xp: newXp },
    leveledUp: newLevel > oldLevel,
    oldLevel,
    newLevel,
  };
}

function dayKey(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

function previousDay(dayIso: string): string {
  const d = new Date(dayIso + "T00:00:00.000Z");
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function evaluateStreak(
  state: ProgressionState,
  todayIso: string,
  todaysCreateMinutes: number,
  thresholdMinutes: number,
): ProgressionState {
  const today = dayKey(todayIso);
  if (todaysCreateMinutes < thresholdMinutes) {
    return state;
  }
  if (state.lastStreakDay === today) {
    return state;
  }
  let newCurrent: number;
  if (state.lastStreakDay && state.lastStreakDay === previousDay(today)) {
    newCurrent = state.currentStreak + 1;
  } else {
    newCurrent = 1;
  }
  const newLongest = Math.max(state.longestStreak, newCurrent);
  return {
    ...state,
    currentStreak: newCurrent,
    longestStreak: newLongest,
    lastStreakDay: today,
  };
}

export function checkBrokenStreak(
  state: ProgressionState,
  todayIso: string,
): ProgressionState {
  const today = dayKey(todayIso);
  if (!state.lastStreakDay) return state;
  if (state.lastStreakDay === today) return state;
  if (state.lastStreakDay === previousDay(today)) return state;
  return { ...state, currentStreak: 0 };
}

export function progressToNextLevel(xp: number): {
  level: number;
  current: number;
  needed: number;
  pct: number;
} {
  const level = levelForXp(xp);
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  if (next === Infinity) {
    return { level, current: xp - base, needed: 0, pct: 1 };
  }
  const span = next - base;
  const current = xp - base;
  return { level, current, needed: span, pct: span === 0 ? 1 : current / span };
}

export const INITIAL_PROGRESSION: ProgressionState = {
  id: "state",
  xp: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastCelebratedLevel: 1,
};
