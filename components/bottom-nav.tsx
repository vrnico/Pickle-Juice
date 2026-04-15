"use client";

import type { Tab } from "./tab-types";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "home", label: "Home", icon: "⏱" },
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "history", label: "History", icon: "📜" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

export function BottomNav({
  current,
  onChange,
}: {
  current: Tab;
  onChange: (tab: Tab) => void;
}) {
  return (
    <nav className="sticky bottom-0 z-20 grid grid-cols-4 border-t border-[color:var(--color-border)] bg-background/95 backdrop-blur">
      {TABS.map((t) => {
        const active = current === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={`flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
              active
                ? "text-[color:var(--color-primary)]"
                : "text-[color:var(--color-muted-foreground)] hover:text-foreground"
            }`}
            aria-current={active ? "page" : undefined}
          >
            <span className="text-lg leading-none" aria-hidden>
              {t.icon}
            </span>
            <span>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
