import { v4 as uuid } from "uuid";
import { getDb, type PickleJuiceDB } from "./db";
import type { PendingResearchEntry } from "./types";

function nowIso() {
  return new Date().toISOString();
}

function deadlineFrom(startIso: string, applyWindowDays: number): string {
  const d = new Date(startIso);
  d.setDate(d.getDate() + applyWindowDays);
  return d.toISOString();
}

export class PendingResearchRepository {
  constructor(private readonly db: PickleJuiceDB = getDb()) {}

  async create(args: {
    todoId: string;
    sessionId: string;
    minutes: number;
    startedAt: string;
    applyWindowDays: number;
  }): Promise<PendingResearchEntry> {
    const entry: PendingResearchEntry = {
      id: uuid(),
      todoId: args.todoId,
      sessionId: args.sessionId,
      minutes: args.minutes,
      startedAt: args.startedAt,
      deadline: deadlineFrom(args.startedAt, args.applyWindowDays),
      status: "pending",
    };
    await this.db.pendingResearch.add(entry);
    return entry;
  }

  async listAll(): Promise<PendingResearchEntry[]> {
    return this.db.pendingResearch.toArray();
  }

  async listPending(): Promise<PendingResearchEntry[]> {
    return this.db.pendingResearch.where("status").equals("pending").toArray();
  }

  async listPendingByTodo(todoId: string): Promise<PendingResearchEntry[]> {
    const all = await this.db.pendingResearch
      .where("todoId")
      .equals(todoId)
      .toArray();
    return all.filter((p) => p.status === "pending");
  }

  async markApplied(id: string): Promise<void> {
    const existing = await this.db.pendingResearch.get(id);
    if (!existing || existing.status !== "pending") return;
    await this.db.pendingResearch.put({
      ...existing,
      status: "applied",
      resolvedAt: nowIso(),
    });
  }

  async markExpired(id: string): Promise<void> {
    const existing = await this.db.pendingResearch.get(id);
    if (!existing || existing.status !== "pending") return;
    await this.db.pendingResearch.put({
      ...existing,
      status: "expired",
      resolvedAt: nowIso(),
    });
  }

  async cancelBySession(sessionId: string): Promise<void> {
    const all = await this.db.pendingResearch
      .where("sessionId")
      .equals(sessionId)
      .toArray();
    for (const p of all) {
      if (p.status !== "pending") continue;
      await this.db.pendingResearch.put({
        ...p,
        status: "cancelled",
        resolvedAt: nowIso(),
      });
    }
  }
}

export const pendingResearchRepository = new PendingResearchRepository();
