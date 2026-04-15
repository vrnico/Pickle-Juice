"use client";

import { useState } from "react";
import type { ConsumeSubtype, QueueItem, Todo } from "@/lib/db/types";
import {
  ResearchQueueRequiresTodoError,
  useQueueActions,
  useQueueItems,
  useTodos,
} from "@/lib/store/use-v2";

export function QueueScreen() {
  const items = useQueueItems();
  const [editing, setEditing] = useState<QueueItem | null>(null);
  const [adding, setAdding] = useState(false);

  const groups = {
    research: items.filter((i) => i.tag === "research"),
    leisure: items.filter((i) => i.tag === "leisure"),
  } as const;

  return (
    <section className="flex flex-col gap-4 p-4">
      <header className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Queue</h2>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="rounded-full bg-foreground px-4 py-2 text-sm text-background"
        >
          Add
        </button>
      </header>

      {items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[color:var(--color-border)] p-6 text-center text-sm text-[color:var(--color-muted-foreground)]">
          Save links here so they're ready when it's time to consume. Items pre-tagged Research are free if linked to a Create todo.
        </div>
      )}

      <Group title="Research" items={groups.research} onEdit={setEditing} />
      <Group title="Leisure" items={groups.leisure} onEdit={setEditing} />

      {(adding || editing) && (
        <QueueDialog
          item={editing}
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
  items,
  onEdit,
}: {
  title: string;
  items: QueueItem[];
  onEdit: (item: QueueItem) => void;
}) {
  const saved = items.filter((i) => i.status === "saved");
  const consumed = items.filter((i) => i.status === "consumed");
  if (saved.length === 0 && consumed.length === 0) return null;
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[color:var(--color-muted-foreground)]">
        {title}
      </h3>
      <ul className="flex flex-col gap-2">
        {saved.map((item) => (
          <Item key={item.id} item={item} onEdit={onEdit} />
        ))}
        {consumed.length > 0 && (
          <li>
            <details className="rounded-md text-sm">
              <summary className="cursor-pointer text-[color:var(--color-muted-foreground)]">
                Recently consumed ({consumed.length})
              </summary>
              <ul className="mt-2 flex flex-col gap-2">
                {consumed.map((item) => (
                  <Item key={item.id} item={item} onEdit={onEdit} muted />
                ))}
              </ul>
            </details>
          </li>
        )}
      </ul>
    </div>
  );
}

function Item({
  item,
  onEdit,
  muted,
}: {
  item: QueueItem;
  onEdit: (item: QueueItem) => void;
  muted?: boolean;
}) {
  const { delete: del, markConsumed } = useQueueActions();
  return (
    <li
      className={`flex items-center gap-3 rounded-xl border border-[color:var(--color-border)] bg-background p-3 ${
        muted ? "opacity-60" : ""
      }`}
    >
      <div className="min-w-0 flex-1">
        <a href={item.url} target="_blank" rel="noreferrer" className="block truncate text-sm font-medium underline-offset-2 hover:underline">
          {item.title}
        </a>
        <p className="truncate text-xs text-[color:var(--color-muted-foreground)]">{item.url}</p>
        {item.description && (
          <p className="mt-1 truncate text-xs text-[color:var(--color-muted-foreground)]">{item.description}</p>
        )}
      </div>
      <div className="flex flex-col gap-1">
        {item.status === "saved" && (
          <button type="button" onClick={() => markConsumed(item.id)} className="rounded-full px-3 py-1 text-xs text-[color:var(--color-muted-foreground)] hover:bg-[color:var(--color-muted)]">
            Consumed
          </button>
        )}
        <button type="button" onClick={() => onEdit(item)} className="rounded-full px-3 py-1 text-xs text-[color:var(--color-muted-foreground)] hover:bg-[color:var(--color-muted)]">
          Edit
        </button>
        <button type="button" onClick={() => del(item.id)} className="rounded-full px-3 py-1 text-xs text-red-500 hover:bg-red-500/10">
          Delete
        </button>
      </div>
    </li>
  );
}

function QueueDialog({ item, onClose }: { item: QueueItem | null; onClose: () => void }) {
  const todos = useTodos();
  const { create, update } = useQueueActions();
  const [title, setTitle] = useState(item?.title ?? "");
  const [url, setUrl] = useState(item?.url ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [tag, setTag] = useState<ConsumeSubtype>(item?.tag ?? "leisure");
  const [linkedTodoId, setLinkedTodoId] = useState<string | undefined>(item?.linkedTodoId);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      const draft = {
        url: url.trim(),
        title: title.trim(),
        description: description.trim() || undefined,
        tag,
        linkedTodoId: tag === "research" ? linkedTodoId : undefined,
      };
      if (item) await update(item.id, draft);
      else await create(draft);
      onClose();
    } catch (e) {
      if (e instanceof ResearchQueueRequiresTodoError) {
        setError("Research items must be linked to a Create todo. Pick one or change tag to Leisure.");
      } else {
        setError(e instanceof Error ? e.message : "Failed to save");
      }
    } finally {
      setSaving(false);
    }
  }

  const activeTodos = todos.filter((t: Todo) => t.status !== "done");

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
      <div className="w-full max-w-md rounded-t-2xl bg-background p-6 shadow-xl sm:rounded-2xl">
        <h2 className="text-lg font-semibold">{item ? "Edit queue item" : "Add to queue"}</h2>
        <div className="mt-4 grid gap-3">
          <label className="grid gap-1 text-sm">
            <span className="font-medium">URL</span>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" className="rounded-md border border-[color:var(--color-border)] bg-background px-3 py-2" />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-md border border-[color:var(--color-border)] bg-background px-3 py-2" />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Description</span>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" className="rounded-md border border-[color:var(--color-border)] bg-background px-3 py-2" />
          </label>
          <fieldset className="grid grid-cols-2 gap-2">
            <TagButton label="Leisure" active={tag === "leisure"} onClick={() => setTag("leisure")} swatch="bg-[color:var(--color-consume)]" />
            <TagButton label="Research" active={tag === "research"} onClick={() => setTag("research")} swatch="bg-[color:var(--color-create)]" />
          </fieldset>
          {tag === "research" && (
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Linked todo (required for Research)</span>
              <select
                value={linkedTodoId ?? ""}
                onChange={(e) => setLinkedTodoId(e.target.value || undefined)}
                className="rounded-md border border-[color:var(--color-border)] bg-background px-3 py-2"
              >
                <option value="">Pick a todo…</option>
                {activeTodos.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </label>
          )}
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

function TagButton({
  label,
  active,
  onClick,
  swatch,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  swatch: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm transition ${
        active ? `border-transparent text-white ${swatch}` : "border-[color:var(--color-border)] text-foreground"
      }`}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}
