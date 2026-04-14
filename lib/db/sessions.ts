import { v4 as uuid } from "uuid";
import { getDb, type PickleJuiceDB } from "./db";
import { sumSecondsByCategory } from "../domain/aggregate";
import { sessionsToCsv } from "../export/csv";
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

export class DexieSessionRepository implements SessionRepository {
  constructor(private readonly db: PickleJuiceDB = getDb()) {}

  async createFromDraft(draft: DraftSession): Promise<Session> {
    assertValidRange(draft.startIso, draft.endIso);
    const now = nowIso();
    const session: Session = {
      id: uuid(),
      category: draft.category,
      startIso: draft.startIso,
      endIso: draft.endIso,
      durationSeconds: secondsBetween(draft.startIso, draft.endIso),
      notes: draft.notes,
      createdAt: now,
      updatedAt: now,
    };
    await this.db.sessions.add(session);
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
    return merged;
  }

  async delete(id: string): Promise<void> {
    await this.db.sessions.delete(id);
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
  DraftSession,
  Session,
  SessionRepository,
} from "./types";
