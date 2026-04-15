import { describe, it, expect } from "vitest";
import {
  canStartLeisure,
  currentBalance,
  entriesForCreateSession,
  entriesForDelete,
  entriesForEdit,
  entriesForLeisureSession,
  entriesForResearchExpiry,
  entryStarterGrant,
  liveBalance,
} from "../time-bank";
import type { PendingResearchEntry, Session } from "../../db/types";

function s(over: Partial<Session>): Session {
  return {
    id: "s",
    category: "create",
    startIso: "2026-04-14T12:00:00.000Z",
    endIso: "2026-04-14T12:30:00.000Z",
    durationSeconds: 1800,
    createdAt: "x",
    updatedAt: "x",
    ...over,
  };
}

describe("currentBalance", () => {
  it("sums entries to the right balance", () => {
    const balance = currentBalance([
      entryStarterGrant(60),
      ...entriesForLeisureSession(s({ category: "consume", subtype: "leisure", durationSeconds: 600 })),
    ]);
    expect(balance).toBe(50);
  });
});

describe("entriesForCreateSession", () => {
  it("emits +duration*ratio for create sessions", () => {
    const entries = entriesForCreateSession(
      s({ category: "create", durationSeconds: 1200 }),
      2.0,
    );
    expect(entries).toHaveLength(1);
    expect(entries[0].amount).toBe(40);
    expect(entries[0].source).toBe("create-session");
  });

  it("emits nothing for non-create sessions", () => {
    expect(entriesForCreateSession(s({ category: "consume" }), 2)).toHaveLength(0);
  });
});

describe("entriesForLeisureSession", () => {
  it("emits -duration for leisure", () => {
    const entries = entriesForLeisureSession(
      s({ category: "consume", subtype: "leisure", durationSeconds: 900 }),
    );
    expect(entries[0].amount).toBe(-15);
  });

  it("emits nothing for research", () => {
    expect(
      entriesForLeisureSession(s({ category: "consume", subtype: "research" })),
    ).toHaveLength(0);
  });
});

describe("entriesForResearchExpiry", () => {
  it("emits -minutes for the expired pending entry", () => {
    const p: PendingResearchEntry = {
      id: "p",
      todoId: "t",
      sessionId: "s",
      minutes: 25,
      startedAt: "x",
      deadline: "y",
      status: "pending",
    };
    const entries = entriesForResearchExpiry(p);
    expect(entries[0].amount).toBe(-25);
    expect(entries[0].source).toBe("research-expiry");
  });
});

describe("entriesForEdit / Delete", () => {
  it("edit emits a reversal + reapply", () => {
    const prev = s({ category: "create", durationSeconds: 1800 });
    const next = s({ category: "create", durationSeconds: 600 });
    const entries = entriesForEdit(prev, next, 2.0);
    const total = entries.reduce((sum, e) => sum + e.amount, 0);
    expect(total).toBeCloseTo(-40, 5);
  });

  it("delete reverses a create credit", () => {
    const entries = entriesForDelete(
      s({ category: "create", durationSeconds: 600 }),
      2.0,
    );
    expect(entries[0].amount).toBe(-20);
  });
});

describe("liveBalance", () => {
  it("returns persisted balance when no leisure session is active", () => {
    expect(liveBalance(50, null, "2026-04-14T12:00:00.000Z")).toBe(50);
  });

  it("ticks down during a leisure session", () => {
    const balance = liveBalance(
      50,
      {
        category: "consume",
        subtype: "leisure",
        startIso: "2026-04-14T12:00:00.000Z",
      },
      "2026-04-14T12:10:00.000Z",
    );
    expect(balance).toBe(40);
  });

  it("doesn't tick during a research session", () => {
    const balance = liveBalance(
      50,
      {
        category: "consume",
        subtype: "research",
        startIso: "2026-04-14T12:00:00.000Z",
      },
      "2026-04-14T12:10:00.000Z",
    );
    expect(balance).toBe(50);
  });
});

describe("canStartLeisure", () => {
  it("true above zero, false at or below zero", () => {
    expect(canStartLeisure(1)).toBe(true);
    expect(canStartLeisure(0)).toBe(false);
    expect(canStartLeisure(-5)).toBe(false);
  });
});
