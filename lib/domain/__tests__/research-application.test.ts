import { describe, it, expect } from "vitest";
import { evaluatePending } from "../research-application";
import type { PendingResearchEntry, Session } from "../../db/types";

function pending(over: Partial<PendingResearchEntry>): PendingResearchEntry {
  return {
    id: "p",
    todoId: "t1",
    sessionId: "s",
    minutes: 20,
    startedAt: "2026-04-01T12:00:00.000Z",
    deadline: "2026-04-08T12:00:00.000Z",
    status: "pending",
    ...over,
  };
}

function create(over: Partial<Session> = {}): Session {
  return {
    id: "create-1",
    category: "create",
    startIso: "2026-04-05T12:00:00.000Z",
    endIso: "2026-04-05T12:30:00.000Z",
    durationSeconds: 1800,
    createdAt: "x",
    updatedAt: "x",
    linkedItemId: "t1",
    ...over,
  };
}

describe("evaluatePending", () => {
  it("applies pending when there is a matching create session", () => {
    const r = evaluatePending("2026-04-09T12:00:00.000Z", [pending({})], [create()]);
    expect(r.apply.map((p) => p.id)).toEqual(["p"]);
    expect(r.expire).toHaveLength(0);
  });

  it("expires when deadline has passed and no create matches", () => {
    const r = evaluatePending("2026-04-09T12:00:00.000Z", [pending({})], []);
    expect(r.expire.map((p) => p.id)).toEqual(["p"]);
    expect(r.apply).toHaveLength(0);
  });

  it("neither applies nor expires while in window with no create", () => {
    const r = evaluatePending("2026-04-05T12:00:00.000Z", [pending({})], []);
    expect(r.apply).toHaveLength(0);
    expect(r.expire).toHaveLength(0);
  });

  it("applies takes priority over expire", () => {
    const r = evaluatePending(
      "2026-04-09T12:00:00.000Z",
      [pending({})],
      [create()],
    );
    expect(r.apply).toHaveLength(1);
    expect(r.expire).toHaveLength(0);
  });

  it("ignores already-resolved entries", () => {
    const r = evaluatePending(
      "2026-04-09T12:00:00.000Z",
      [pending({ status: "applied" }), pending({ status: "expired" })],
      [],
    );
    expect(r.apply).toHaveLength(0);
    expect(r.expire).toHaveLength(0);
  });
});
