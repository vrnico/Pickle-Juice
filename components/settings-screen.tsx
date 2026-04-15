"use client";

import { useEffect, useState } from "react";
import { exportSessionsCsv } from "@/lib/store/use-sessions";
import {
  usePrefs,
  usePrefsActions,
  useResetBank,
} from "@/lib/store/use-v2";

export function SettingsScreen() {
  const prefs = usePrefs();
  const prefsActions = usePrefsActions();
  const resetBank = useResetBank();
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [exportKind, setExportKind] = useState<"info" | "error">("info");
  const [exporting, setExporting] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  async function handleExport() {
    setExportMessage(null);
    setExporting(true);
    try {
      const filename = await exportSessionsCsv();
      if (filename === null) {
        setExportKind("error");
        setExportMessage("Nothing to export yet — record a session first.");
      } else {
        setExportKind("info");
        setExportMessage(`Exported ${filename}.`);
      }
    } catch (e) {
      setExportKind("error");
      setExportMessage(e instanceof Error ? e.message : "Export failed.");
    } finally {
      setExporting(false);
      setTimeout(() => setExportMessage(null), 5000);
    }
  }

  const bookmarkletJs = origin
    ? `javascript:void(window.open('${origin}/share?title='+encodeURIComponent(document.title)+'&url='+encodeURIComponent(location.href),'_blank'))`
    : "";

  return (
    <section className="flex flex-col gap-4 p-4">
      <h2 className="px-1 text-2xl font-semibold">Settings</h2>

      <Card title="Time Bank">
        <SliderRow
          label="Earn ratio"
          help="Minutes of leisure consume credit per minute created"
          value={prefs.earnRatio}
          min={1}
          max={5}
          step={0.5}
          unit="× per min"
          onChange={(v) => prefsActions.update({ earnRatio: v })}
        />
        <SliderRow
          label="Apply window"
          help="Days to log Create work after a Research session before it gets debited"
          value={prefs.applyWindowDays}
          min={1}
          max={30}
          step={1}
          unit="days"
          onChange={(v) => prefsActions.update({ applyWindowDays: v })}
        />
        <button
          type="button"
          onClick={async () => {
            if (confirm("Reset Time Bank to 0? Past sessions are kept; this just zeros the balance.")) {
              await resetBank();
            }
          }}
          className="rounded-full border border-red-500 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10"
        >
          Reset Time Bank
        </button>
      </Card>

      <Card title="Pomodoro">
        <NumberRow
          label="Focus length (min)"
          value={prefs.focusMinutes}
          min={5}
          max={60}
          onChange={(v) => prefsActions.update({ focusMinutes: v })}
        />
        <NumberRow
          label="Break length (min)"
          value={prefs.breakMinutes}
          min={1}
          max={30}
          onChange={(v) => prefsActions.update({ breakMinutes: v })}
        />
      </Card>

      <Card title="Streaks">
        <NumberRow
          label="Streak threshold (Create min/day)"
          value={prefs.streakThresholdMinutes}
          min={1}
          max={120}
          onChange={(v) => prefsActions.update({ streakThresholdMinutes: v })}
        />
      </Card>

      <Card title="Add to Pickle Juice (Bookmarklet)">
        <p className="text-sm text-[color:var(--color-muted-foreground)]">
          Drag this link to your bookmarks bar. Click it on any page (a YouTube video, a blog post)
          to open Pickle Juice with the URL pre-filled.
        </p>
        <div className="mt-2">
          {origin ? (
            <a
              href={bookmarkletJs}
              onClick={(e) => e.preventDefault()}
              className="inline-block rounded-full bg-[color:var(--color-primary)] px-4 py-2 text-sm text-[color:var(--color-primary-foreground)]"
              draggable
            >
              + Add to Pickle Juice
            </a>
          ) : (
            <p className="text-sm text-[color:var(--color-muted-foreground)]">Loading…</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(bookmarkletJs)}
          className="mt-3 rounded-full border border-[color:var(--color-border)] px-3 py-1 text-xs"
        >
          Copy bookmarklet code
        </button>
      </Card>

      <Card title="Export">
        <p className="text-sm text-[color:var(--color-muted-foreground)]">
          Download every stored session as a CSV. The file stays on your device.
        </p>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="mt-3 rounded-full bg-foreground px-5 py-2 text-sm text-background disabled:opacity-50"
        >
          {exporting ? "Exporting…" : "Export CSV"}
        </button>
        {exportMessage && (
          <p
            role={exportKind === "error" ? "alert" : undefined}
            className={`mt-3 text-sm ${
              exportKind === "error" ? "text-red-600" : "text-[color:var(--color-muted-foreground)]"
            }`}
          >
            {exportMessage}
          </p>
        )}
      </Card>

      <Card title="About">
        <p className="text-sm text-[color:var(--color-muted-foreground)]">
          Pickle Juice stores everything in this browser&rsquo;s IndexedDB — no account, no server,
          no sync. Clearing browser storage will erase your data, so export if you want a backup.
        </p>
      </Card>
    </section>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="rounded-2xl border border-[color:var(--color-border)] bg-background p-5">
      <h3 className="text-base font-semibold">{title}</h3>
      <div className="mt-3 flex flex-col gap-3">{children}</div>
    </article>
  );
}

function SliderRow({
  label,
  help,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  help?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="flex items-baseline justify-between">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-[color:var(--color-muted-foreground)]">
          {value} {unit}
        </span>
      </span>
      {help && <span className="text-xs text-[color:var(--color-muted-foreground)]">{help}</span>}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="accent-[color:var(--color-primary)]"
      />
    </label>
  );
}

function NumberRow({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm">
      <span className="font-medium">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value))))}
        className="w-24 rounded-md border border-[color:var(--color-border)] bg-background px-3 py-1.5 text-right tabular-nums"
      />
    </label>
  );
}
