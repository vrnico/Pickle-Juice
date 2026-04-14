import type { ActiveSession, Category, DraftSession, Session } from "../db/types";

export const MIN_SESSION_SECONDS = 1;

export type TimerState =
  | { kind: "idle" }
  | { kind: "running"; category: Category; startIso: string };

export function initialState(): TimerState {
  return { kind: "idle" };
}

export function fromActive(active: ActiveSession): TimerState {
  if (!active) return { kind: "idle" };
  return { kind: "running", category: active.category, startIso: active.startIso };
}

export function toActive(state: TimerState): ActiveSession {
  if (state.kind === "idle") return null;
  return { category: state.category, startIso: state.startIso };
}

export function start(
  state: TimerState,
  category: Category,
  nowIso: string,
): TimerState {
  if (state.kind !== "idle") {
    throw new Error("cannot start: a session is already running");
  }
  return { kind: "running", category, startIso: nowIso };
}

export interface StopResult {
  nextState: TimerState;
  draft: DraftSession | null;
}

export function stop(state: TimerState, nowIso: string): StopResult {
  if (state.kind !== "running") {
    throw new Error("cannot stop: no session is running");
  }
  const durationSec = Math.floor(
    (new Date(nowIso).getTime() - new Date(state.startIso).getTime()) / 1000,
  );
  if (durationSec < MIN_SESSION_SECONDS) {
    return { nextState: { kind: "idle" }, draft: null };
  }
  return {
    nextState: { kind: "idle" },
    draft: {
      category: state.category,
      startIso: state.startIso,
      endIso: nowIso,
    },
  };
}

export function elapsedSeconds(state: TimerState, nowIso: string): number {
  if (state.kind !== "running") return 0;
  const ms = new Date(nowIso).getTime() - new Date(state.startIso).getTime();
  return Math.max(0, Math.floor(ms / 1000));
}

export interface InterruptedSummary {
  category: Category;
  startIso: string;
  elapsedSeconds: number;
}

export function describeInterrupted(
  active: NonNullable<ActiveSession>,
  nowIso: string,
): InterruptedSummary {
  return {
    category: active.category,
    startIso: active.startIso,
    elapsedSeconds: elapsedSeconds(
      { kind: "running", category: active.category, startIso: active.startIso },
      nowIso,
    ),
  };
}

export function endInterruptedNow(
  active: NonNullable<ActiveSession>,
  nowIso: string,
): StopResult {
  return stop(
    { kind: "running", category: active.category, startIso: active.startIso },
    nowIso,
  );
}

export function keepRunning(active: NonNullable<ActiveSession>): TimerState {
  return {
    kind: "running",
    category: active.category,
    startIso: active.startIso,
  };
}

export function isPersistedSessionEqual(a: Session, b: Session): boolean {
  return (
    a.id === b.id &&
    a.category === b.category &&
    a.startIso === b.startIso &&
    a.endIso === b.endIso &&
    a.durationSeconds === b.durationSeconds
  );
}
