"use client";

import {
  useAllSessions,
  useLast7DaysRatio,
  useTodaysRatio,
} from "@/lib/store/use-sessions";
import { RatioBar } from "./ratio-bar";
import type { Tab } from "./tab-types";

export function DashboardScreen({ onTabChange }: { onTabChange: (t: Tab) => void }) {
  const sessions = useAllSessions();
  const today = useTodaysRatio(sessions);
  const week = useLast7DaysRatio(sessions);

  if (sessions.length === 0) {
    return (
      <section className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <span className="text-5xl" aria-hidden>
          🥒
        </span>
        <h2 className="text-xl font-semibold">No sessions yet</h2>
        <p className="max-w-xs text-sm text-[color:var(--color-muted-foreground)]">
          Tap Consume or Create on the Home screen to start your first session.
        </p>
        <button
          type="button"
          onClick={() => onTabChange("home")}
          className="rounded-full bg-foreground px-5 py-2 text-sm text-background"
        >
          Go to Home
        </button>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4 p-4">
      <h2 className="px-1 text-2xl font-semibold">Dashboard</h2>
      <RatioBar title="Today" summary={today} />
      <RatioBar title="Last 7 days" summary={week} />
    </section>
  );
}
