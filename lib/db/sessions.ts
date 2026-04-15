import { v4 as uuid } from "uuid";
import { getDb, type PickleJuiceDB } from "./db";
import { sumSecondsByCategory } from "../domain/aggregate";
import { sessionsToCsv } from "../export/csv";
import {
  entriesForCreateSession,
  entriesForDelete,
  entriesForEdit,
  entriesForLeisureSession,
} from "../domain/time-bank";
import {
  addXp,
  checkBrokenStreak,
  evaluateStreak,
  xpForSession,
} from "../domain/progression";
import { BankRepository } from "./bank";
import { PendingResearchRepository } from "./pending-research";
import { PrefsRepository } from "./prefs";
import { ProgressionRepository } from "./progression";
import { QueueRepository } from "./queue";
import { TodoRepository } from "./todos";
import type {
  ActiveSession,
  Category,
  DraftSession,
  Session,
  SessionRepository,
} from "./types";

const ACTIVE_KEY = "active_session";

function nowIso(): string {
  return new Date().toISOString();
}

function secondsBetween(startIso: string, endIso: string): number {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) {
    throw new Error("Invalid ISO timestamp");
  }
  return Math.max(0, Math.round((end - start) / 1000));
}

function assertValidRange(startIso: string, endIso: string) {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) {
    throw new Error("Invalid ISO timestamp");
  }
  if (end <= start) {
    throw new Error("end must be after start");
  }
}

function isLeisure(s: { category: Category; subtype?: string }) {
  return s.category === "consume" && s.subtype === "leisure";
}

function isResearch(s: { category: Category; subtype?: string }) {
  return s.category === "consume" && s.subtype === "research";
}

export class DexieSessionRepository implements SessionRepository {
  private readonly bank: BankRepository;
  private readonly pendingResearch: PendingResearchRepository;
  private readonly prefs: PrefsRepository;
  private readonly progression: ProgressionRepository;
  private readonly queue: QueueRepository;
  private readonly todos: TodoRepository;

  constructor(private readonly db: PickleJuiceDB = getDb()) {
    this.bank = new BankRepository(db);
    this.pendingResearch = new PendingResearchRepository(db);
    this.prefs = new PrefsRepository(db);
    this.progression = new ProgressionRepository(db);
    this.queue = new QueueRepository(db);
    this.todos = new TodoRepository(db);
  }

  async createFromDraft(draft: DraftSession): Promise<Session> {
    assertValidRange(draft.startIso, draft.endIso);
    if (draft.category === "consume" && !draft.subtype) {
      draft = { ...draft, subtype: "leisure" };
    }
    const now = nowIso();
    const session: Session = {
      id: uuid(),
      category: draft.category,
      subtype: draft.subtype,
      linkedItemId: draft.linkedItemId,
      startIso: draft.startIso,
      endIso: draft.endIso,
      durationSeconds: secondsBetween(draft.startIso, draft.endIso),
      notes: draft.notes,
      createdAt: now,
      updatedAt: now,
    };
    await this.db.sessions.add(session);

    const prefs = await this.prefs.get();

    if (session.category === "create") {
      await this.bank.append(entriesForCreateSession(session, prefs.earnRatio));
      if (session.linkedItemId) {
        const pending = await this.pendingResearch.listPendingByTodo(session.linkedItemId);
        for (const p of pending) {
          await this.pendingResearch.markApplied(p.id);
        }
      }
    } else if (isLeisure(session)) {
      await this.bank.append(entriesForLeisureSession(session));
    } else if (isResearch(session) && session.linkedItemId) {
      await this.pendingResearch.create({
        todoId: session.linkedItemId,
        sessionId: session.id,
        minutes: session.durationSeconds / 60,
        startedAt: session.startIso,
        applyWindowDays: prefs.applyWindowDays,
      });
    }

    if (session.linkedItemId && session.category === "consume") {
      await this.queue.markConsumed(session.linkedItemId).catch(() => undefined);
    }

    await this.awardXpAndStreak(session);

    return session;
  }

  async update(id: string, patch: Partial<DraftSession>): Promise<Session> {
    const existing = await this.db.sessions.get(id);
    if (!existing) throw new Error(`session ${id} not found`);
    const merged: Session = {
      ...existing,
      ...patch,
      updatedAt: nowIso(),
    };
    assertValidRange(merged.startIso, merged.endIso);
    merged.durationSeconds = secondsBetween(merged.startIso, merged.endIso);
    await this.db.sessions.put(merged);

    const prefs = await this.prefs.get();
    await this.bank.append(entriesForEdit(existing, merged, prefs.earnRatio));

    if (isResearch(existing) && existing.linkedItemId && existing.id) {
      await this.pendingResearch.cancelBySession(existing.id);
    }
    if (isResearch(merged) && merged.linkedItemId) {
      await this.pendingResearch.create({
        todoId: merged.linkedItemId,
        sessionId: merged.id,
        minutes: merged.durationSeconds / 60,
        startedAt: merged.startIso,
        applyWindowDays: prefs.applyWindowDays,
      });
    }

    return merged;
  }

  async delete(id: string): Promise<void> {
    const existing = await this.db.sessions.get(id);
    if (!existing) return;
    await this.db.sessions.delete(id);
    const prefs = await this.prefs.get();
    await this.bank.append(entriesForDelete(existing, prefs.earnRatio));
    if (isResearch(existing)) {
      await this.pendingResearch.cancelBySession(existing.id);
    }
  }

  async listAll(): Promise<Session[]> {
    const rows = await this.db.sessions.toArray();
    return rows.sort((a, b) => b.startIso.localeCompare(a.startIso));
  }

  async listByRange(startIso: string, endIso: string): Promise<Session[]> {
    const rows = await this.db.sessions
      .where("startIso")
      .between(startIso, endIso, true, true)
      .toArray();
    return rows.sort((a, b) => b.startIso.localeCompare(a.startIso));
  }

  async getActive(): Promise<ActiveSession> {
    const row = await this.db.meta.get(ACTIVE_KEY);
    if (!row) return null;
    try {
      return JSON.parse(row.value) as ActiveSession;
    } catch {
      return null;
    }
  }

  async setActive(active: ActiveSession): Promise<void> {
    if (active === null) {
      await this.db.meta.delete(ACTIVE_KEY);
      return;
    }
    await this.db.meta.put({ key: ACTIVE_KEY, value: JSON.stringify(active) });
  }

  async sumByCategory(
    startIso: string,
    endIso: string,
  ): Promise<Record<Category, number>> {
    const sessions = await this.listByRange(startIso, endIso);
    return sumSecondsByCategory(sessions);
  }

  async exportCsvBlob(): Promise<Blob> {
    const sessions = await this.listAll();
    if (sessions.length === 0) {
      throw new EmptyExportError();
    }
    const csv = sessionsToCsv(sessions);
    return new Blob([csv], { type: "text/csv;charset=utf-8" });
  }

  private async awardXpAndStreak(session: Session) {
    const prefs = await this.prefs.get();
    const before = await this.progression.get();
    const xp = xpForSession(session, prefs);
    const xpResult = addXp(before, xp);
    let next = xpResult.newState;

    if (session.category === "create") {
      const dayStart = new Date(session.startIso);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(session.startIso);
      dayEnd.setHours(23, 59, 59, 999);
      const dayCreates = await this.listByRange(
        dayStart.toISOString(),
        dayEnd.toISOString(),
      );
      const todaysCreateMinutes =
        dayCreates
          .filter((s) => s.category === "create")
          .reduce((sum, s) => sum + s.durationSeconds, 0) / 60;
      next = evaluateStreak(
        next,
        session.startIso,
        todaysCreateMinutes,
        prefs.streakThresholdMinutes,
      );
    }

    next = checkBrokenStreak(next, nowIso());
    await this.progression.put(next);
  }
}

export class EmptyExportError extends Error {
  constructor() {
    super("No sessions to export");
    this.name = "EmptyExportError";
  }
}

export const sessionRepository: SessionRepository = new DexieSessionRepository();

export type {
  ActiveSession,
  Category,
  ConsumeSubtype,
  DraftSession,
  Session,
  SessionRepository,
} from "./types";
