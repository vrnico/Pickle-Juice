import { describe, it, expect } from "vitest";
import {
  initialState,
  pomodoroFocusElapsed,
  pomodoroSecondsRemaining,
  start,
  stop,
} from "../timer";

const T0 = "2026-04-14T12:00:00.000Z";
const T_25_min = "2026-04-14T12:25:00.000Z";
const T_24_min = "2026-04-14T12:24:00.000Z";

describe("Pomodoro state", () => {
  it("starts in focus phase with the configured durations", () => {
    const s = start(
      initialState(),
      { category: "create", pomodoro: { focusMinutes: 25, breakMinutes: 5 } },
      T0,
    );
    expect(s.kind).toBe("running");
    if (s.kind !== "running" || !s.pomodoro) throw new Error();
    expect(s.pomodoro.phase).toBe("focus");
    expect(s.pomodoro.focusMinutes).toBe(25);
    expect(s.pomodoro.breakMinutes).toBe(5);
    expect(s.pomodoro.phaseStartIso).toBe(T0);
  });

  it("pomodoroFocusElapsed flips at the focus duration", () => {
    const s = start(
      initialState(),
      { category: "create", pomodoro: { focusMinutes: 25, breakMinutes: 5 } },
      T0,
    );
    expect(pomodoroFocusElapsed(s, T_24_min)).toBe(false);
    expect(pomodoroFocusElapsed(s, T_25_min)).toBe(true);
  });

  it("pomodoroSecondsRemaining counts down", () => {
    const s = start(
      initialState(),
      { category: "consume", subtype: "leisure", pomodoro: { focusMinutes: 25, breakMinutes: 5 } },
      T0,
    );
    expect(pomodoroSecondsRemaining(s, T_24_min)).toBe(60);
    expect(pomodoroSecondsRemaining(s, T_25_min)).toBe(0);
  });

  it("stop preserves subtype and linkedItemId on the draft", () => {
    const s = start(
      initialState(),
      { category: "consume", subtype: "leisure", linkedItemId: "q1" },
      T0,
    );
    const { draft } = stop(s, T_25_min);
    expect(draft).toMatchObject({
      category: "consume",
      subtype: "leisure",
      linkedItemId: "q1",
    });
  });
});
