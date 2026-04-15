"use client";

import { useState } from "react";
import type { ConsumeSubtype, QueueItem } from "@/lib/db/types";
import { useQueueItems } from "@/lib/store/use-v2";

export interface ConsumePickerSelection {
  subtype: ConsumeSubtype;
  linkedItemId?: string;
}

export function ConsumePicker({
  bankBalance,
  onCancel,
  onPick,
}: {
  bankBalance: number;
  onCancel: () => void;
  onPick: (sel: ConsumePickerSelection) => void;
}) {
  const items = useQueueItems();
  const [tab, setTab] = useState<ConsumeSubtype>("research");
  const tabItems = items.filter((i) => i.tag === tab && i.status === "saved");
  const leisureBlocked = bankBalance <= 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
    >
      <div className="flex max-h-[85vh] w-full max-w-md flex-col rounded-t-2xl bg-background p-5 shadow-xl sm:rounded-2xl">
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">What are you consuming?</h2>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-2 py-1 text-sm text-[color:var(--color-muted-foreground)]"
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <SubtypeTab label="Research" active={tab === "research"} onClick={() => setTab("research")} hint="Free if applied" />
          <SubtypeTab
            label="Leisure"
            active={tab === "leisure"}
            onClick={() => setTab("leisure")}
            hint={leisureBlocked ? "Bank empty" : `${Math.round(bankBalance)} min in bank`}
          />
        </div>

        {tab === "leisure" && leisureBlocked && (
          <p className="mt-3 rounded-md bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
            Your bank is empty. Earn time by logging Create work first.
          </p>
        )}

        <ul className="mt-3 flex-1 space-y-2 overflow-y-auto">
          {tabItems.length === 0 && (
            <li className="rounded-md border border-dashed border-[color:var(--color-border)] p-4 text-sm text-[color:var(--color-muted-foreground)]">
              No saved {tab} items. Add one in the Queue tab, or pick Freestyle.
            </li>
          )}
          {tabItems.map((item) => (
            <li key={item.id}>
              <PickerItem
                item={item}
                disabled={tab === "leisure" && leisureBlocked}
                onClick={() =>
                  onPick({ subtype: tab, linkedItemId: item.id })
                }
              />
            </li>
          ))}
        </ul>

        <button
          type="button"
          disabled={tab === "leisure" && leisureBlocked}
          onClick={() => onPick({ subtype: tab })}
          className="mt-4 w-full rounded-full bg-foreground py-3 text-sm font-medium text-background disabled:opacity-50"
        >
          Freestyle {tab === "research" ? "Research" : "Leisure"}
        </button>
      </div>
    </div>
  );
}

function SubtypeTab({
  label,
  active,
  onClick,
  hint,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start rounded-xl border p-3 text-left text-sm transition ${
        active
          ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/10"
          : "border-[color:var(--color-border)]"
      }`}
      aria-pressed={active}
    >
      <span className="font-semibold">{label}</span>
      {hint && (
        <span className="text-xs text-[color:var(--color-muted-foreground)]">{hint}</span>
      )}
    </button>
  );
}

function PickerItem({
  item,
  disabled,
  onClick,
}: {
  item: QueueItem;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="block w-full rounded-xl border border-[color:var(--color-border)] p-3 text-left text-sm transition hover:bg-[color:var(--color-muted)] disabled:opacity-50"
    >
      <p className="truncate font-medium">{item.title}</p>
      <p className="truncate text-xs text-[color:var(--color-muted-foreground)]">{item.url}</p>
    </button>
  );
}
