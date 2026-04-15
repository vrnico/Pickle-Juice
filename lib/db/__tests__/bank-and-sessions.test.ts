import "fake-indexeddb/auto";
import { describe, it, expect, beforeEach } from "vitest";
import { __resetDbForTests } from "../db";
import { DexieSessionRepository } from "../sessions";
import { BankRepository } from "../bank";
import { PrefsRepository } from "../prefs";
import { TodoRepository } from "../todos";
import { PendingResearchRepository } from "../pending-research";

function freshRepos(name: string) {
  const db = __resetDbForTests(name + "_" + Math.random().toString(36).slice(2));
  return {
    db,
    sessions: new DexieSessionRepository(db),
    bank: new BankRepository(db),
    prefs: new PrefsRepository(db),
    todos: new TodoRepository(db),
    pending: new PendingResearchRepository(db),
  };
}

const T0 = "2026-04-14T12:00:00.000Z";
const T1 = "2026-04-14T12:30:00.000Z"; // +30 min
const T2 = "2026-04-14T13:00:00.000Z"; // +60 min from T0

describe("bank earn / debit / edit / delete", () => {
  let r: ReturnType<typeof freshRepos>;
  beforeEach(() => {
    r = freshRepos("bank");
  });

  it("Create session credits bank at default earn ratio of 2.0", async () => {
    await r.sessions.createFromDraft({
      category: "create",
      startIso: T0,
      endIso: T1,
    });
    expect(await r.bank.getBalance()).toBe(60);
  });

  it("Leisure consume debits the bank", async () => {
    await r.sessions.createFromDraft({
      category: "consume",
      subtype: "leisure",
      startIso: T0,
      endIso: T1,
    });
    expect(await r.bank.getBalance()).toBe(-30);
  });

  it("custom earn ratio is applied to subsequent sessions", async () => {
    await r.prefs.update({ earnRatio: 1.5 });
    await r.sessions.createFromDraft({
      category: "create",
      startIso: T0,
      endIso: "2026-04-14T12:20:00.000Z",
    });
    expect(await r.bank.getBalance()).toBe(30);
  });

  it("Research consume does NOT debit the bank — pending entry written instead", async () => {
    const todo = await r.todos.create({ title: "shader research" });
    await r.sessions.createFromDraft({
      category: "consume",
      subtype: "research",
      linkedItemId: todo.id,
      startIso: T0,
      endIso: T1,
    });
    expect(await r.bank.getBalance()).toBe(0);
    const pending = await r.pending.listPending();
    expect(pending).toHaveLength(1);
    expect(pending[0].minutes).toBe(30);
  });

  it("editing a leisure session adjusts the bank by net minutes", async () => {
    const s = await r.sessions.createFromDraft({
      category: "consume",
      subtype: "leisure",
      startIso: T0,
      endIso: "2026-04-14T12:10:00.000Z",
    });
    expect(await r.bank.getBalance()).toBe(-10);
    await r.sessions.update(s.id, { endIso: "2026-04-14T12:05:00.000Z" });
    expect(await r.bank.getBalance()).toBe(-5);
  });

  it("deleting a Create session reverses the credit", async () => {
    const s = await r.sessions.createFromDraft({
      category: "create",
      startIso: T0,
      endIso: T2,
    });
    expect(await r.bank.getBalance()).toBe(120);
    await r.sessions.delete(s.id);
    expect(await r.bank.getBalance()).toBe(0);
  });

  it("starter grant is idempotent", async () => {
    await r.bank.ensureStarterGrant();
    await r.bank.ensureStarterGrant();
    await r.bank.ensureStarterGrant();
    expect(await r.bank.getBalance()).toBe(60);
  });
});

describe("research application", () => {
  let r: ReturnType<typeof freshRepos>;
  beforeEach(() => {
    r = freshRepos("research");
  });

  it("Create session against the same todo applies pending research", async () => {
    const todo = await r.todos.create({ title: "T" });
    await r.sessions.createFromDraft({
      category: "consume",
      subtype: "research",
      linkedItemId: todo.id,
      startIso: T0,
      endIso: T1,
    });
    expect((await r.pending.listPending()).length).toBe(1);

    await r.sessions.createFromDraft({
      category: "create",
      linkedItemId: todo.id,
      startIso: T1,
      endIso: T2,
    });
    expect(await r.pending.listPending()).toHaveLength(0);
    const all = await r.pending.listAll();
    expect(all[0].status).toBe("applied");
  });

  it("deleting a research session cancels its pending entry", async () => {
    const todo = await r.todos.create({ title: "T" });
    const s = await r.sessions.createFromDraft({
      category: "consume",
      subtype: "research",
      linkedItemId: todo.id,
      startIso: T0,
      endIso: T1,
    });
    await r.sessions.delete(s.id);
    const all = await r.pending.listAll();
    expect(all[0].status).toBe("cancelled");
    expect(await r.bank.getBalance()).toBe(0);
  });
});

describe("v1 → v2 schema migration backfills subtype", () => {
  it("write-path defaults missing consume subtype to leisure", async () => {
    const r2 = freshRepos("migrate");
    const s = await r2.sessions.createFromDraft({
      category: "consume",
      startIso: T0,
      endIso: T1,
    } as any);
    expect(s.subtype).toBe("leisure");
    expect(await r2.bank.getBalance()).toBe(-30);
  });
});

describe("queue auto-mark consumed on session", () => {
  it("marks the linked queue item as consumed when the session ends", async () => {
    const r3 = freshRepos("queue-auto");
    const { queueRepository } = await import("../queue");
    const q = new (await import("../queue")).QueueRepository(r3.db);
    const item = await q.create({
      url: "https://x",
      title: "x",
      tag: "leisure",
    });
    await r3.sessions.createFromDraft({
      category: "consume",
      subtype: "leisure",
      linkedItemId: item.id,
      startIso: T0,
      endIso: T1,
    });
    const fresh = await q.get(item.id);
    expect(fresh?.status).toBe("consumed");
    void queueRepository;
  });
});
