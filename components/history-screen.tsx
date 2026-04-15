"use client";

import { useMemo, useState } from "react";
import type { Session } from "@/lib/db/types";
import {
  useAllSessions,
  useSessionActions,
} from "@/lib/store/use-sessions";
import { EditSessionDialog } from "./edit-session-dialog";
import {
  formatDateHeading,
  formatDuration,
  formatLocalTime,
  isoDateKey,
} from "./format";
import type { Tab } from "./tab-types";

export function HistoryScreen({ onTabChange }: { onTabChange: (t: Tab) => void }) {
  const sessions = useAllSessions();
  const { remove } = useSessionActions();
  const [editing, setEditing] = useState<Session | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Session | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, Session[]>();
    for (const s of sessions) {
      const key = isoDateKey(s.startIso);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [sessions]);

  if (sessions.length === 0) {
    return (
      <section className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <h2 className="text-xl font-semibold">No history yet</h2>
        <p className="max-w-xs text-sm text-[color:var(--color-muted-foreground)]">
          Completed sessions will appear here grouped by day.
        </p>
        <button
          type="button"
          onClick={() => onTabChange("home")}
          className="rounded-full bg-foreground px-5 py-2 text-sm text-background"
        >
          Start a session
        </button>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6 p-4">
      <h2 className="px-1 text-2xl font-semibold">History</h2>
      {grouped.map(([key, list]) => (
        <div key={key}>
          <h3 className="mb-2 px-1 text-sm font-semibold uppercase tracking-wide text-[color:var(--color-muted-foreground)]">
            {formatDateHeading(list[0].startIso)}
          </h3>
          <ul className="flex flex-col gap-2">
            {list.map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-3 rounded-xl border border-[color:var(--color-border)] bg-background p-3"
              >
                <span
                  className={`h-8 w-1 shrink-0 rounded-full ${
                    s.category === "consume"
                      ? "bg-[color:var(--color-consume)]"
                      : "bg-[color:var(--color-create)]"
                  }`}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium capitalize">{s.category}</p>
                  <p className="text-xs text-[color:var(--color-muted-foreground)]">
                    {formatLocalTime(s.startIso)} · {formatDuration(s.durationSeconds)}
                  </p>
                  {s.notes && (
                    <p className="mt-1 truncate text-xs text-[color:var(--color-muted-foreground)]">
                      {s.notes}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setEditing(s)}
                    className="rounded-full px-3 py-1 text-xs text-[color:var(--color-muted-foreground)] hover:bg-[color:var(--color-muted)]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(s)}
                    className="rounded-full px-3 py-1 text-xs text-red-500 hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {editing && <EditSessionDialog session={editing} onClose={() => setEditing(null)} />}

      {confirmDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <div className="w-full max-w-sm rounded-2xl bg-background p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Delete session?</h2>
            <p className="mt-2 text-sm text-[color:var(--color-muted-foreground)]">
              This will remove the session from history and the dashboard. It
              can&rsquo;t be undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="rounded-full border border-[color:var(--color-border)] px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await remove(confirmDelete.id);
                  setConfirmDelete(null);
                }}
                className="rounded-full bg-red-500 px-4 py-2 text-sm text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
