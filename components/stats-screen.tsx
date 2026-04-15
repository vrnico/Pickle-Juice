"use client";

import {
  useAllSessions,
  useLast7DaysRatio,
  useTodaysRatio,
} from "@/lib/store/use-sessions";
import { DashboardScreen } from "./dashboard-screen";
import { HistoryScreen } from "./history-screen";
import type { Tab } from "./tab-types";

export function StatsScreen({ onTabChange }: { onTabChange: (t: Tab) => void }) {
  // Render Dashboard + History stacked. Profile lives on its own tab.
  void useAllSessions;
  void useLast7DaysRatio;
  void useTodaysRatio;
  return (
    <div className="flex flex-col">
      <DashboardScreen onTabChange={onTabChange} />
      <HistoryScreen onTabChange={onTabChange} />
    </div>
  );
}
