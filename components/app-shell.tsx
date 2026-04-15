"use client";

import { useEffect, useState } from "react";
import { BootEffects } from "./boot";
import { BottomNav } from "./bottom-nav";
import { HomeScreen } from "./home-screen";
import { InstallPrompt } from "./install-prompt";
import { InterruptedRecovery } from "./interrupted-recovery";
import { ProfileScreen } from "./profile-screen";
import { QueueScreen } from "./queue-screen";
import { SettingsScreen } from "./settings-screen";
import { StatsScreen } from "./stats-screen";
import { ThemeProvider } from "./theme-provider";
import { TodosScreen } from "./todos-screen";
import type { Tab } from "./tab-types";

const HASH_TO_TAB: Record<string, Tab> = {
  "#home": "home",
  "#queue": "queue",
  "#todos": "todos",
  "#stats": "stats",
  "#profile": "profile",
  "#settings": "settings",
};

export function AppShell() {
  const [tab, setTab] = useState<Tab>("home");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fromHash = HASH_TO_TAB[window.location.hash];
    if (fromHash) setTab(fromHash);
  }, []);

  function setTabAndHash(t: Tab) {
    setTab(t);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${t}`);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <BootEffects />
      <ThemeProvider />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col pb-4">
        {tab === "home" && <HomeScreen />}
        {tab === "queue" && <QueueScreen />}
        {tab === "todos" && <TodosScreen />}
        {tab === "stats" && <StatsScreen onTabChange={setTabAndHash} />}
        {tab === "profile" && <ProfileScreen />}
        {tab === "settings" && <SettingsScreen />}
      </main>
      <BottomNav current={tab} onChange={setTabAndHash} />
      <InterruptedRecovery />
      <InstallPrompt />
    </div>
  );
}
