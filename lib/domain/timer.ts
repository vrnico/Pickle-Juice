import type {
  ActiveSession,
  Category,
  ConsumeSubtype,
  DraftSession,
  PomodoroState,
  Session,
} from "../db/types";

export const MIN_SESSION_SECONDS = 1;

export type TimerState =
  | { kind: "idle" }
  | {
      kind: "running";
      category: Category;
      subtype?: ConsumeSubtype;
      linkedItemId?: string;
      startIso: string;
      pomodoro?: PomodoroState;
    };

export function initialState(): TimerState {
  return { kind: "idle" };
}

export function fromActive(active: ActiveSession): TimerState {
  if (!active) return { kind: "idle" };
  return {
    kind: "running",
    category: active.category,
    subtype: active.subtype,
    linkedItemId: active.linkedItemId,
    startIso: active.startIso,
    pomodoro: active.pomodoro,
  };
}

export function toActive(state: TimerState): ActiveSession {
  if (state.kind === "idle") return null;
  return {
    category: state.category,
    subtype: state.subtype,
    linkedItemId: state.linkedItemId,
    startIso: state.startIso,
    pomodoro: state.pomodoro,
  };
}

export interface StartArgs {
  category: Category;
  subtype?: ConsumeSubtype;
  linkedItemId?: string;
  pomodoro?: { focusMinutes: number; breakMinutes: number };
}

export function start(
  state: TimerState,
  args: StartArgs,
  nowIso: string,
): TimerState {
  if (state.kind !== "idle") {
    throw new Error("cannot start: a session is already running");
  }
  return {
    kind: "running",
    category: args.category,
    subtype: args.subtype,
    linkedItemId: args.linkedItemId,
    startIso: nowIso,
    pomodoro: args.pomodoro
      ? {
          focusMinutes: args.pomodoro.focusMinutes,
          breakMinutes: args.pomodoro.breakMinutes,
          phase: "focus",
          phaseStartIso: nowIso,
        }
      : undefined,
  };
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
      subtype: state.subtype,
      linkedItemId: state.linkedItemId,
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

export function pomodoroFocusElapsed(state: TimerState, nowIso: string): boolean {
  if (state.kind !== "running" || !state.pomodoro) return false;
  if (state.pomodoro.phase !== "focus") return false;
  const elapsedMin =
    (new Date(nowIso).getTime() - new Date(state.pomodoro.phaseStartIso).getTime()) /
    60_000;
  return elapsedMin >= state.pomodoro.focusMinutes;
}

export function pomodoroSecondsRemaining(state: TimerState, nowIso: string): number {
  if (state.kind !== "running" || !state.pomodoro) return 0;
  const elapsedSec =
    (new Date(nowIso).getTime() - new Date(state.pomodoro.phaseStartIso).getTime()) /
    1000;
  const totalSec =
    (state.pomodoro.phase === "focus"
      ? state.pomodoro.focusMinutes
      : state.pomodoro.breakMinutes) * 60;
  return Math.max(0, Math.floor(totalSec - elapsedSec));
}

export interface InterruptedSummary {
  category: Category;
  subtype?: ConsumeSubtype;
  linkedItemId?: string;
  startIso: string;
  elapsedSeconds: number;
}

export function describeInterrupted(
  active: NonNullable<ActiveSession>,
  nowIso: string,
): InterruptedSummary {
  return {
    category: active.category,
    subtype: active.subtype,
    linkedItemId: active.linkedItemId,
    startIso: active.startIso,
    elapsedSeconds: elapsedSeconds(fromActive(active), nowIso),
  };
}

export function endInterruptedNow(
  active: NonNullable<ActiveSession>,
  nowIso: string,
): StopResult {
  return stop(fromActive(active), nowIso);
}

export function keepRunning(active: NonNullable<ActiveSession>): TimerState {
  return fromActive(active);
}

export function isPersistedSessionEqual(a: Session, b: Session): boolean {
  return (
    a.id === b.id &&
    a.category === b.category &&
    a.subtype === b.subtype &&
    a.linkedItemId === b.linkedItemId &&
    a.startIso === b.startIso &&
    a.endIso === b.endIso &&
    a.durationSeconds === b.durationSeconds
  );
}
