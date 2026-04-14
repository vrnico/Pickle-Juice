import type { Session } from "../db/types";

const CSV_HEADERS = [
  "id",
  "category",
  "start_iso",
  "end_iso",
  "duration_seconds",
  "notes",
] as const;

function escapeField(value: string | number | undefined): string {
  const s = value === undefined || value === null ? "" : String(value);
  const needsQuotes = /[",\r\n]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

export function sessionsToCsv(sessions: Session[]): string {
  const lines: string[] = [CSV_HEADERS.join(",")];
  for (const s of sessions) {
    lines.push(
      [
        escapeField(s.id),
        escapeField(s.category),
        escapeField(s.startIso),
        escapeField(s.endIso),
        escapeField(s.durationSeconds),
        escapeField(s.notes ?? ""),
      ].join(","),
    );
  }
  return lines.join("\r\n") + "\r\n";
}

export function exportFilename(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `picklejuice-export-${y}-${m}-${d}.csv`;
}
