"use client";

import { useState } from "react";
import { BottomNav } from "./bottom-nav";
import { DashboardScreen } from "./dashboard-screen";
import { HistoryScreen } from "./history-screen";
import { HomeScreen } from "./home-screen";
import { InstallPrompt } from "./install-prompt";
import { InterruptedRecovery } from "./interrupted-recovery";
import { SettingsScreen } from "./settings-screen";
import type { Tab } from "./tab-types";

export function AppShell() {
  const [tab, setTab] = useState<Tab>("home");

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col pb-4">
        {tab === "home" && <HomeScreen />}
        {tab === "dashboard" && <DashboardScreen onTabChange={setTab} />}
        {tab === "history" && <HistoryScreen onTabChange={setTab} />}
        {tab === "settings" && <SettingsScreen />}
      </main>
      <BottomNav current={tab} onChange={setTab} />
      <InterruptedRecovery />
      <InstallPrompt />
    </div>
  );
}
