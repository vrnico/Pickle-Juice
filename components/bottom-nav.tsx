"use client";

import type { Tab } from "./tab-types";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "home", label: "Home", icon: "⏱" },
  { id: "queue", label: "Queue", icon: "🍿" },
  { id: "todos", label: "Todos", icon: "✅" },
  { id: "stats", label: "Stats", icon: "📊" },
  { id: "profile", label: "Profile", icon: "🥒" },
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
    <nav className="sticky bottom-0 z-20 grid grid-cols-6 border-t border-[color:var(--color-border)] bg-background/95 backdrop-blur">
      {TABS.map((t) => {
        const active = current === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={`flex flex-col items-center gap-1 py-2 text-[10px] transition-colors sm:text-xs ${
              active
                ? "text-[color:var(--color-primary)]"
                : "text-[color:var(--color-muted-foreground)] hover:text-foreground"
            }`}
            aria-current={active ? "page" : undefined}
          >
            <span className="text-base leading-none sm:text-lg" aria-hidden>
              {t.icon}
            </span>
            <span>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
