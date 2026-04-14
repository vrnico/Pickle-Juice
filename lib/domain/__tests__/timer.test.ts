import { describe, it, expect } from "vitest";
import {
  describeInterrupted,
  elapsedSeconds,
  endInterruptedNow,
  fromActive,
  initialState,
  keepRunning,
  start,
  stop,
  toActive,
} from "../timer";

const T0 = "2026-04-14T12:00:00.000Z";
const T30s = "2026-04-14T12:00:30.000Z";
const Thalf = "2026-04-14T12:00:00.500Z";

describe("timer state machine", () => {
  it("starts from idle", () => {
    const s = start(initialState(), "create", T0);
    expect(s.kind).toBe("running");
  });

  it("rejects double-start", () => {
    const s = start(initialState(), "create", T0);
    expect(() => start(s, "consume", T0)).toThrow();
  });

  it("stops with non-zero duration and returns a draft", () => {
    const s = start(initialState(), "consume", T0);
    const { nextState, draft } = stop(s, T30s);
    expect(nextState.kind).toBe("idle");
    expect(draft).toEqual({ category: "consume", startIso: T0, endIso: T30s });
  });

  it("discards stops under 1 second", () => {
    const s = start(initialState(), "create", T0);
    const { nextState, draft } = stop(s, Thalf);
    expect(nextState.kind).toBe("idle");
    expect(draft).toBeNull();
  });

  it("rejects stop while idle", () => {
    expect(() => stop(initialState(), T30s)).toThrow();
  });

  it("round-trips fromActive/toActive", () => {
    const active = { category: "consume" as const, startIso: T0 };
    const state = fromActive(active);
    expect(state.kind).toBe("running");
    expect(toActive(state)).toEqual(active);
    expect(toActive(initialState())).toBeNull();
  });

  it("describeInterrupted returns category + startIso + elapsed", () => {
    const active = { category: "create" as const, startIso: T0 };
    const summary = describeInterrupted(active, T30s);
    expect(summary).toEqual({ category: "create", startIso: T0, elapsedSeconds: 30 });
  });

  it("endInterruptedNow saves when > 1s and discards when < 1s", () => {
    const active = { category: "consume" as const, startIso: T0 };
    const big = endInterruptedNow(active, T30s);
    expect(big.draft).not.toBeNull();
    const tiny = endInterruptedNow(active, Thalf);
    expect(tiny.draft).toBeNull();
  });

  it("keepRunning returns a running state matching the active", () => {
    const active = { category: "create" as const, startIso: T0 };
    const state = keepRunning(active);
    expect(state).toEqual({ kind: "running", category: "create", startIso: T0 });
  });

  it("elapsedSeconds is zero when idle", () => {
    expect(elapsedSeconds(initialState(), T30s)).toBe(0);
  });
});
