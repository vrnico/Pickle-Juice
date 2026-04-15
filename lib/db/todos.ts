import { v4 as uuid } from "uuid";
import { getDb, type PickleJuiceDB } from "./db";
import type { Session, Todo, TodoStatus } from "./types";

function nowIso() {
  return new Date().toISOString();
}

export interface TodoDraft {
  title: string;
  description?: string;
  status?: TodoStatus;
}

export interface TodoActivity {
  totalSeconds: number;
  sessionCount: number;
  recent: Session[];
}

export class TodoRepository {
  constructor(private readonly db: PickleJuiceDB = getDb()) {}

  async create(draft: TodoDraft): Promise<Todo> {
    if (!draft.title.trim()) throw new Error("Title is required");
    const now = nowIso();
    const todo: Todo = {
      id: uuid(),
      title: draft.title.trim(),
      description: draft.description?.trim() || undefined,
      status: draft.status ?? "pending",
      createdAt: now,
      updatedAt: now,
    };
    await this.db.todos.add(todo);
    return todo;
  }

  async update(id: string, patch: Partial<TodoDraft>): Promise<Todo> {
    const existing = await this.db.todos.get(id);
    if (!existing) throw new Error(`todo ${id} not found`);
    const next: Todo = { ...existing, ...patch, updatedAt: nowIso() };
    if (patch.status === "done" && existing.status !== "done") {
      next.completedAt = nowIso();
    }
    if (patch.status && patch.status !== "done") {
      next.completedAt = undefined;
    }
    await this.db.todos.put(next);
    return next;
  }

  async setStatus(id: string, status: TodoStatus): Promise<Todo> {
    return this.update(id, { status });
  }

  async delete(id: string): Promise<void> {
    await this.db.todos.delete(id);
  }

  async get(id: string): Promise<Todo | undefined> {
    return this.db.todos.get(id);
  }

  async listAll(): Promise<Todo[]> {
    const rows = await this.db.todos.toArray();
    return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async listByStatus(status: TodoStatus): Promise<Todo[]> {
    return this.db.todos.where("status").equals(status).toArray();
  }

  async recentActivity(todoId: string, limit = 5): Promise<TodoActivity> {
    const sessions = await this.db.sessions
      .where("linkedItemId")
      .equals(todoId)
      .toArray();
    const sorted = sessions.sort((a, b) => b.startIso.localeCompare(a.startIso));
    const totalSeconds = sorted.reduce((sum, s) => sum + s.durationSeconds, 0);
    return {
      totalSeconds,
      sessionCount: sorted.length,
      recent: sorted.slice(0, limit),
    };
  }
}

export const todoRepository = new TodoRepository();
