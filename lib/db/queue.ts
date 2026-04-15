import { v4 as uuid } from "uuid";
import { getDb, type PickleJuiceDB } from "./db";
import type { ConsumeSubtype, QueueItem } from "./types";

function nowIso() {
  return new Date().toISOString();
}

export interface QueueDraft {
  url: string;
  title: string;
  description?: string;
  tag: ConsumeSubtype;
  linkedTodoId?: string;
}

function validate(draft: QueueDraft) {
  if (draft.tag === "research" && !draft.linkedTodoId) {
    throw new ResearchQueueRequiresTodoError();
  }
  if (!draft.url.trim()) throw new Error("URL is required");
  if (!draft.title.trim()) throw new Error("Title is required");
}

export class ResearchQueueRequiresTodoError extends Error {
  constructor() {
    super("Research queue items must be linked to a Create todo");
    this.name = "ResearchQueueRequiresTodoError";
  }
}

export class QueueRepository {
  constructor(private readonly db: PickleJuiceDB = getDb()) {}

  async create(draft: QueueDraft): Promise<QueueItem> {
    validate(draft);
    const now = nowIso();
    const item: QueueItem = {
      id: uuid(),
      url: draft.url.trim(),
      title: draft.title.trim(),
      description: draft.description?.trim() || undefined,
      tag: draft.tag,
      linkedTodoId: draft.linkedTodoId,
      status: "saved",
      createdAt: now,
      updatedAt: now,
    };
    await this.db.queueItems.add(item);
    return item;
  }

  async update(id: string, patch: Partial<QueueDraft>): Promise<QueueItem> {
    const existing = await this.db.queueItems.get(id);
    if (!existing) throw new Error(`queue item ${id} not found`);
    const merged: QueueItem = { ...existing, ...patch, updatedAt: nowIso() };
    if (patch.tag === "research" || existing.tag === "research") {
      const checkDraft: QueueDraft = {
        url: merged.url,
        title: merged.title,
        description: merged.description,
        tag: merged.tag,
        linkedTodoId: merged.linkedTodoId,
      };
      validate(checkDraft);
    }
    await this.db.queueItems.put(merged);
    return merged;
  }

  async delete(id: string): Promise<void> {
    await this.db.queueItems.delete(id);
  }

  async get(id: string): Promise<QueueItem | undefined> {
    return this.db.queueItems.get(id);
  }

  async listAll(): Promise<QueueItem[]> {
    const rows = await this.db.queueItems.toArray();
    return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async listByTag(tag: ConsumeSubtype): Promise<QueueItem[]> {
    const rows = await this.db.queueItems.where("tag").equals(tag).toArray();
    return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async markConsumed(id: string): Promise<void> {
    const existing = await this.db.queueItems.get(id);
    if (!existing) return;
    await this.db.queueItems.put({
      ...existing,
      status: "consumed",
      consumedAt: nowIso(),
      updatedAt: nowIso(),
    });
  }
}

export const queueRepository = new QueueRepository();
