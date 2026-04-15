"use client";

import { useEffect, useState } from "react";
import {
  useActiveSession,
  useTimerActions,
} from "@/lib/store/use-sessions";
import { formatDuration } from "./format";
import * as timer from "@/lib/domain/timer";

export function InterruptedRecovery() {
  const { active, loading } = useActiveSession();
  const { endInterruptedNow } = useTimerActions();
  const [snapshot, setSnapshot] = useState<{
    category: "consume" | "create";
    startIso: string;
    elapsedSeconds: number;
  } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (loading || dismissed || !active) return;
    if (snapshot) return;
    const summary = timer.describeInterrupted(active, new Date().toISOString());
    // Only prompt if the session has been running long enough that it was
    // plausibly left behind across a reload (e.g. ≥ 60s).
    if (summary.elapsedSeconds >= 60) {
      setSnapshot(summary);
    }
  }, [active, loading, snapshot, dismissed]);

  if (!snapshot) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
    >
      <div className="w-full max-w-sm rounded-2xl bg-background p-6 shadow-xl">
        <h2 className="text-lg font-semibold">Pick up where you left off?</h2>
        <p className="mt-2 text-sm text-[color:var(--color-muted-foreground)]">
          A <span className="font-medium capitalize">{snapshot.category}</span>{" "}
          session has been running since{" "}
          {new Date(snapshot.startIso).toLocaleTimeString()} —{" "}
          {formatDuration(snapshot.elapsedSeconds)} elapsed.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              setDismissed(true);
              setSnapshot(null);
            }}
            className="rounded-full bg-foreground px-4 py-2 text-sm text-background"
          >
            Keep running
          </button>
          <button
            type="button"
            onClick={async () => {
              await endInterruptedNow();
              setDismissed(true);
              setSnapshot(null);
            }}
            className="rounded-full border border-[color:var(--color-border)] px-4 py-2 text-sm"
          >
            End now
          </button>
        </div>
      </div>
    </div>
  );
}
