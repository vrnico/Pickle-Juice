"use client";

import { useState } from "react";
import type { Category, Session } from "@/lib/db/types";
import { useSessionActions } from "@/lib/store/use-sessions";
import { fromLocalInputValue, toLocalInputValue } from "./format";

export function EditSessionDialog({
  session,
  onClose,
}: {
  session: Session;
  onClose: () => void;
}) {
  const { update } = useSessionActions();
  const [category, setCategory] = useState<Category>(session.category);
  const [startLocal, setStartLocal] = useState(toLocalInputValue(session.startIso));
  const [endLocal, setEndLocal] = useState(toLocalInputValue(session.endIso));
  const [notes, setNotes] = useState(session.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      await update(session.id, {
        category,
        startIso: fromLocalInputValue(startLocal),
        endIso: fromLocalInputValue(endLocal),
        notes: notes.trim() === "" ? undefined : notes.trim(),
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
    >
      <div className="w-full max-w-md rounded-t-2xl bg-background p-6 shadow-xl sm:rounded-2xl">
        <h2 className="text-lg font-semibold">Edit session</h2>

        <div className="mt-4 grid gap-4">
          <div className="grid grid-cols-2 gap-2">
            <CategoryRadio
              label="Consume"
              value="consume"
              checked={category === "consume"}
              onChange={setCategory}
              swatch="bg-[color:var(--color-consume)]"
            />
            <CategoryRadio
              label="Create"
              value="create"
              checked={category === "create"}
              onChange={setCategory}
              swatch="bg-[color:var(--color-create)]"
            />
          </div>

          <label className="grid gap-1 text-sm">
            <span className="font-medium">Start</span>
            <input
              type="datetime-local"
              value={startLocal}
              onChange={(e) => setStartLocal(e.target.value)}
              className="rounded-md border border-[color:var(--color-border)] bg-background px-3 py-2"
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="font-medium">End</span>
            <input
              type="datetime-local"
              value={endLocal}
              onChange={(e) => setEndLocal(e.target.value)}
              className="rounded-md border border-[color:var(--color-border)] bg-background px-3 py-2"
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="font-medium">Notes</span>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional"
              className="rounded-md border border-[color:var(--color-border)] bg-background px-3 py-2"
            />
          </label>

          {error && (
            <p role="alert" className="rounded-md bg-red-500/10 p-3 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[color:var(--color-border)] px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="rounded-full bg-foreground px-4 py-2 text-sm text-background disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryRadio({
  label,
  value,
  checked,
  onChange,
  swatch,
}: {
  label: string;
  value: Category;
  checked: boolean;
  onChange: (c: Category) => void;
  swatch: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={`flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
        checked
          ? "border-transparent text-white " + swatch
          : "border-[color:var(--color-border)] text-foreground"
      }`}
      aria-pressed={checked}
    >
      {label}
    </button>
  );
}
