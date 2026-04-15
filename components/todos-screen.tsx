"use client";

import { useEffect, useState } from "react";
import type { Todo, TodoStatus } from "@/lib/db/types";
import {
  todoRepository,
  usePendingResearchByTodo,
  useTodoActions,
  useTodos,
} from "@/lib/store/use-v2";
import { useAllSessions as useAllSessionsFromBase } from "@/lib/store/use-sessions";
import { formatDuration, formatMinutes } from "./format";

export function TodosScreen() {
  const todos = useTodos();
  const [editing, setEditing] = useState<Todo | null>(null);
  const [adding, setAdding] = useState(false);

  const groups: Record<TodoStatus, Todo[]> = {
    pending: todos.filter((t) => t.status === "pending"),
    "in-progress": todos.filter((t) => t.status === "in-progress"),
    done: todos.filter((t) => t.status === "done"),
  };

  return (
    <section className="flex flex-col gap-4 p-4">
      <header className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Todos</h2>
        <button type="button" onClick={() => setAdding(true)} className="rounded-full bg-foreground px-4 py-2 text-sm text-background">
          Add
        </button>
      </header>

      {todos.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[color:var(--color-border)] p-6 text-center text-sm text-[color:var(--color-muted-foreground)]">
          Add todos for the Create work you want to focus on. Pick one when you start a Create session to track time against it.
        </div>
      )}

      <Group title="In progress" todos={groups["in-progress"]} onEdit={setEditing} />
      <Group title="Pending" todos={groups.pending} onEdit={setEditing} />
      <Group title="Done" todos={groups.done} onEdit={setEditing} muted />

      {(adding || editing) && (
        <TodoDialog
          todo={editing}
          onClose={() => {
            setAdding(false);
            setEditing(null);
          }}
        />
      )}
    </section>
  );
}

function Group({
  title,
  todos,
  onEdit,
  muted,
}: {
  title: string;
  todos: Todo[];
  onEdit: (t: Todo) => void;
  muted?: boolean;
}) {
  if (todos.length === 0) return null;
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[color:var(--color-muted-foreground)]">
        {title}
      </h3>
      <ul className="flex flex-col gap-2">
        {todos.map((t) => (
          <li key={t.id} className={muted ? "opacity-60" : ""}>
            <TodoCard todo={t} onEdit={onEdit} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function TodoCard({ todo, onEdit }: { todo: Todo; onEdit: (t: Todo) => void }) {
  const { delete: del, setStatus } = useTodoActions();
  const pending = usePendingResearchByTodo(todo.id);
  const sessions = useAllSessionsFromBase();
  const linkedSessions = sessions.filter((s) => s.linkedItemId === todo.id);
  const totalSeconds = linkedSessions.reduce((sum, s) => sum + s.durationSeconds, 0);

  return (
    <article className="rounded-xl border border-[color:var(--color-border)] bg-background p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{todo.title}</p>
          {todo.description && (
            <p className="mt-1 truncate text-xs text-[color:var(--color-muted-foreground)]">{todo.description}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-[color:var(--color-muted-foreground)]">
            <span>{formatMinutes(totalSeconds)} logged</span>
            <span>·</span>
            <span>{linkedSessions.length} session{linkedSessions.length === 1 ? "" : "s"}</span>
            {pending.length > 0 && (
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-700 dark:text-amber-400">
                {Math.round(pending.reduce((sum, p) => sum + p.minutes, 0))} min research pending — apply by{" "}
                {new Date(pending[0].deadline).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          {todo.status !== "done" && (
            <button type="button" onClick={() => setStatus(todo.id, "done")} className="rounded-full px-3 py-1 text-xs text-[color:var(--color-muted-foreground)] hover:bg-[color:var(--color-muted)]">
              Done
            </button>
          )}
          <button type="button" onClick={() => onEdit(todo)} className="rounded-full px-3 py-1 text-xs text-[color:var(--color-muted-foreground)] hover:bg-[color:var(--color-muted)]">
            Edit
          </button>
          <button type="button" onClick={() => del(todo.id)} className="rounded-full px-3 py-1 text-xs text-red-500 hover:bg-red-500/10">
            Delete
          </button>
        </div>
      </div>
      {linkedSessions.length > 0 && (
        <details className="mt-2 text-xs text-[color:var(--color-muted-foreground)]">
          <summary className="cursor-pointer">Recent sessions</summary>
          <ul className="mt-1 space-y-1">
            {linkedSessions.slice(0, 5).map((s) => (
              <li key={s.id}>
                {new Date(s.startIso).toLocaleString()} · {formatDuration(s.durationSeconds)} · {s.category}
                {s.subtype ? ` (${s.subtype})` : ""}
              </li>
            ))}
          </ul>
        </details>
      )}
    </article>
  );
}

function TodoDialog({ todo, onClose }: { todo: Todo | null; onClose: () => void }) {
  const { create, update } = useTodoActions();
  const [title, setTitle] = useState(todo?.title ?? "");
  const [description, setDescription] = useState(todo?.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      if (todo) await update(todo.id, { title, description });
      else await create({ title, description });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
      <div className="w-full max-w-md rounded-t-2xl bg-background p-6 shadow-xl sm:rounded-2xl">
        <h2 className="text-lg font-semibold">{todo ? "Edit todo" : "Add todo"}</h2>
        <div className="mt-4 grid gap-3">
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-md border border-[color:var(--color-border)] bg-background px-3 py-2" />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Description</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" rows={3} className="rounded-md border border-[color:var(--color-border)] bg-background px-3 py-2" />
          </label>
          {error && <p role="alert" className="rounded-md bg-red-500/10 p-3 text-sm text-red-600">{error}</p>}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full border border-[color:var(--color-border)] px-4 py-2 text-sm">Cancel</button>
          <button type="button" disabled={saving} onClick={handleSave} className="rounded-full bg-foreground px-4 py-2 text-sm text-background disabled:opacity-50">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

void todoRepository;
void useEffect;
