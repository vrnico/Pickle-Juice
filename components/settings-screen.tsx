"use client";

import { useState } from "react";
import { exportSessionsCsv } from "@/lib/store/use-sessions";

export function SettingsScreen() {
  const [message, setMessage] = useState<string | null>(null);
  const [kind, setKind] = useState<"info" | "error">("info");
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setMessage(null);
    setExporting(true);
    try {
      const filename = await exportSessionsCsv();
      if (filename === null) {
        setKind("error");
        setMessage("Nothing to export yet — record a session first.");
      } else {
        setKind("info");
        setMessage(`Exported ${filename}.`);
      }
    } catch (e) {
      setKind("error");
      setMessage(e instanceof Error ? e.message : "Export failed.");
    } finally {
      setExporting(false);
      setTimeout(() => setMessage(null), 5000);
    }
  }

  return (
    <section className="flex flex-col gap-4 p-4">
      <h2 className="px-1 text-2xl font-semibold">Settings</h2>

      <article className="rounded-2xl border border-[color:var(--color-border)] bg-background p-5">
        <h3 className="text-base font-semibold">Export</h3>
        <p className="mt-1 text-sm text-[color:var(--color-muted-foreground)]">
          Download every stored session as a CSV. The file stays on your device.
        </p>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="mt-4 rounded-full bg-foreground px-5 py-2 text-sm text-background disabled:opacity-50"
        >
          {exporting ? "Exporting…" : "Export CSV"}
        </button>
        {message && (
          <p
            role={kind === "error" ? "alert" : undefined}
            className={`mt-3 text-sm ${
              kind === "error" ? "text-red-600" : "text-[color:var(--color-muted-foreground)]"
            }`}
          >
            {message}
          </p>
        )}
      </article>

      <article className="rounded-2xl border border-[color:var(--color-border)] bg-background p-5">
        <h3 className="text-base font-semibold">About Pickle Juice</h3>
        <p className="mt-1 text-sm text-[color:var(--color-muted-foreground)]">
          Your sessions live in this browser&rsquo;s IndexedDB. No server, no account,
          no sync. Clearing browser storage will erase your data, so export if you
          want a backup.
        </p>
      </article>
    </section>
  );
}
