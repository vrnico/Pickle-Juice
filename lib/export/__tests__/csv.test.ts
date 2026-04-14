import { describe, it, expect } from "vitest";
import { exportFilename, sessionsToCsv } from "../csv";
import type { Session } from "../../db/types";

function session(overrides: Partial<Session> = {}): Session {
  return {
    id: "abc",
    category: "consume",
    startIso: "2026-04-14T12:00:00.000Z",
    endIso: "2026-04-14T12:30:00.000Z",
    durationSeconds: 1800,
    notes: undefined,
    createdAt: "2026-04-14T12:00:00.000Z",
    updatedAt: "2026-04-14T12:00:00.000Z",
    ...overrides,
  };
}

describe("sessionsToCsv", () => {
  it("writes header then row, CRLF-terminated", () => {
    const csv = sessionsToCsv([session()]);
    const lines = csv.split("\r\n");
    expect(lines[0]).toBe("id,category,start_iso,end_iso,duration_seconds,notes");
    expect(lines[1]).toContain("abc");
    expect(csv.endsWith("\r\n")).toBe(true);
  });

  it("escapes commas, quotes, newlines per RFC 4180", () => {
    const csv = sessionsToCsv([
      session({ notes: 'has, comma and "quote" and\nnewline' }),
    ]);
    expect(csv).toContain('"has, comma and ""quote"" and\nnewline"');
  });

  it("handles unicode notes", () => {
    const csv = sessionsToCsv([session({ notes: "🥒 pickle juice — 时间" })]);
    expect(csv).toContain("🥒 pickle juice — 时间");
  });

  it("empty notes render as empty field", () => {
    const csv = sessionsToCsv([session({ notes: undefined })]);
    expect(csv.split("\r\n")[1].endsWith(",")).toBe(true);
  });
});

describe("exportFilename", () => {
  it("formats as picklejuice-export-YYYY-MM-DD.csv", () => {
    const name = exportFilename(new Date("2026-04-14T12:00:00.000Z"));
    expect(name).toMatch(/^picklejuice-export-\d{4}-\d{2}-\d{2}\.csv$/);
  });
});
