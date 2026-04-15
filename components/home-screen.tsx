"use client";

import { useState } from "react";
import type { Category } from "@/lib/db/types";
import {
  useActiveSession,
  useElapsedSeconds,
  useTimerActions,
} from "@/lib/store/use-sessions";
import { formatDuration } from "./format";

const CATEGORY_COPY: Record<Category, { label: string; swatch: string }> = {
  consume: { label: "Consume", swatch: "bg-[color:var(--color-consume)]" },
  create: { label: "Create", swatch: "bg-[color:var(--color-create)]" },
};

export function HomeScreen() {
  const { active, loading } = useActiveSession();
  const elapsed = useElapsedSeconds(active);
  const { start, stop } = useTimerActions();
  const [pendingCategory, setPendingCategory] = useState<Category | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  async function handleStart(category: Category) {
    const result = await start(category);
    if (!result.ok && result.alreadyActive) {
      setPendingCategory(category);
    }
  }

  async function handleStop() {
    const saved = await stop();
    if (saved === null) {
      setSavedMessage("Discarded — session was under a second.");
    } else {
      setSavedMessage(`Saved ${formatDuration(saved.durationSeconds)} of ${saved.category}.`);
    }
    setTimeout(() => setSavedMessage(null), 3500);
  }

  async function confirmSwitch() {
    if (!pendingCategory) return;
    await stop();
    await start(pendingCategory);
    setPendingCategory(null);
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted">Loading…</p>
      </div>
    );
  }

  if (active) {
    const copy = CATEGORY_COPY[active.category];
    return (
      <section className="flex flex-1 flex-col items-center justify-center gap-8 p-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1 text-sm font-medium text-white ${copy.swatch}`}
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
            {copy.label}
          </span>
          <p className="text-[color:var(--color-muted-foreground)]">
            Session started {new Date(active.startIso).toLocaleTimeString()}
          </p>
        </div>
        <p className="text-6xl font-semibold tabular-nums tracking-tight sm:text-7xl">
          {formatDuration(elapsed)}
        </p>
        <button
          type="button"
          onClick={handleStop}
          className="w-full max-w-xs rounded-full bg-foreground px-6 py-4 text-lg font-medium text-background shadow-sm transition hover:opacity-90"
        >
          Stop
        </button>
        {savedMessage && (
          <p className="text-sm text-[color:var(--color-muted-foreground)]">{savedMessage}</p>
        )}
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <div>
        <h1 className="text-3xl font-semibold">What are you doing right now?</h1>
        <p className="mt-2 text-[color:var(--color-muted-foreground)]">
          Tap a category to start tracking.
        </p>
      </div>
      <div className="grid w-full max-w-md gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => handleStart("consume")}
          className="flex flex-col items-start gap-2 rounded-2xl bg-[color:var(--color-consume)] p-6 text-left text-white shadow-sm transition hover:brightness-110"
        >
          <span className="text-2xl">🍿</span>
          <span className="text-xl font-semibold">Consume</span>
          <span className="text-sm opacity-80">Reading, watching, scrolling.</span>
        </button>
        <button
          type="button"
          onClick={() => handleStart("create")}
          className="flex flex-col items-start gap-2 rounded-2xl bg-[color:var(--color-create)] p-6 text-left text-white shadow-sm transition hover:brightness-110"
        >
          <span className="text-2xl">✍️</span>
          <span className="text-xl font-semibold">Create</span>
          <span className="text-sm opacity-80">Writing, making, building.</span>
        </button>
      </div>
      {savedMessage && (
        <p className="text-sm text-[color:var(--color-muted-foreground)]">{savedMessage}</p>
      )}

      {pendingCategory && (
        <ConfirmSwitchDialog
          targetCategory={pendingCategory}
          onCancel={() => setPendingCategory(null)}
          onConfirm={confirmSwitch}
        />
      )}
    </section>
  );
}

function ConfirmSwitchDialog({
  targetCategory,
  onCancel,
  onConfirm,
}: {
  targetCategory: Category;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div className="w-full max-w-sm rounded-2xl bg-background p-6 shadow-xl">
        <h2 className="text-lg font-semibold">Stop current session first?</h2>
        <p className="mt-2 text-sm text-[color:var(--color-muted-foreground)]">
          Only one session can run at a time. Stop the active session and start a
          new {CATEGORY_COPY[targetCategory].label} session?
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-[color:var(--color-border)] px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-foreground px-4 py-2 text-sm text-background"
          >
            Stop & start new
          </button>
        </div>
      </div>
    </div>
  );
}
