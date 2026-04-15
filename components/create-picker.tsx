"use client";

import { useTodos } from "@/lib/store/use-v2";

export interface CreatePickerSelection {
  linkedItemId?: string;
}

export function CreatePicker({
  onCancel,
  onPick,
}: {
  onCancel: () => void;
  onPick: (sel: CreatePickerSelection) => void;
}) {
  const todos = useTodos();
  const active = todos.filter((t) => t.status === "pending" || t.status === "in-progress");

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
    >
      <div className="flex max-h-[85vh] w-full max-w-md flex-col rounded-t-2xl bg-background p-5 shadow-xl sm:rounded-2xl">
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">What are you creating?</h2>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-2 py-1 text-sm text-[color:var(--color-muted-foreground)]"
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <ul className="mt-3 flex-1 space-y-2 overflow-y-auto">
          {active.length === 0 && (
            <li className="rounded-md border border-dashed border-[color:var(--color-border)] p-4 text-sm text-[color:var(--color-muted-foreground)]">
              No active todos. Add one in the Todos tab, or pick Freestyle.
            </li>
          )}
          {active.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => onPick({ linkedItemId: t.id })}
                className="block w-full rounded-xl border border-[color:var(--color-border)] p-3 text-left text-sm transition hover:bg-[color:var(--color-muted)]"
              >
                <p className="font-medium">{t.title}</p>
                <p className="text-xs capitalize text-[color:var(--color-muted-foreground)]">
                  {t.status.replace("-", " ")}
                </p>
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => onPick({})}
          className="mt-4 w-full rounded-full bg-foreground py-3 text-sm font-medium text-background"
        >
          Freestyle Create
        </button>
      </div>
    </div>
  );
}
