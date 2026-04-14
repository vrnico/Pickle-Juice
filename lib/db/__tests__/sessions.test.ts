import "fake-indexeddb/auto";
import { describe, it, expect, beforeEach } from "vitest";
import { DexieSessionRepository, EmptyExportError } from "../sessions";
import { __resetDbForTests } from "../db";

function mk(name: string) {
  const db = __resetDbForTests(name + "_" + Math.random().toString(36).slice(2));
  return new DexieSessionRepository(db);
}

const T0 = "2026-04-14T12:00:00.000Z";
const T1 = "2026-04-14T12:30:00.000Z";

describe("DexieSessionRepository", () => {
  let repo: DexieSessionRepository;

  beforeEach(() => {
    repo = mk("roundtrip");
  });

  it("round-trips create → listAll", async () => {
    const s = await repo.createFromDraft({
      category: "create",
      startIso: T0,
      endIso: T1,
    });
    expect(s.id).toMatch(/[0-9a-f-]{36}/);
    expect(s.durationSeconds).toBe(1800);
    const all = await repo.listAll();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe(s.id);
  });

  it("updates category and recomputes duration", async () => {
    const s = await repo.createFromDraft({
      category: "consume",
      startIso: T0,
      endIso: T1,
    });
    const updated = await repo.update(s.id, {
      category: "create",
      endIso: "2026-04-14T13:00:00.000Z",
    });
    expect(updated.category).toBe("create");
    expect(updated.durationSeconds).toBe(3600);
  });

  it("rejects update when end is before start", async () => {
    const s = await repo.createFromDraft({
      category: "consume",
      startIso: T0,
      endIso: T1,
    });
    await expect(
      repo.update(s.id, { endIso: "2026-04-14T11:00:00.000Z" }),
    ).rejects.toThrow(/end must be after start/);
  });

  it("deletes a session", async () => {
    const s = await repo.createFromDraft({
      category: "create",
      startIso: T0,
      endIso: T1,
    });
    await repo.delete(s.id);
    const all = await repo.listAll();
    expect(all).toHaveLength(0);
  });

  it("lists by startIso range inclusive", async () => {
    await repo.createFromDraft({
      category: "create",
      startIso: "2026-04-13T10:00:00.000Z",
      endIso: "2026-04-13T11:00:00.000Z",
    });
    await repo.createFromDraft({
      category: "consume",
      startIso: T0,
      endIso: T1,
    });
    const today = await repo.listByRange(
      "2026-04-14T00:00:00.000Z",
      "2026-04-14T23:59:59.999Z",
    );
    expect(today).toHaveLength(1);
    expect(today[0].category).toBe("consume");
  });

  it("persists and clears active session", async () => {
    await repo.setActive({ category: "create", startIso: T0 });
    expect(await repo.getActive()).toEqual({ category: "create", startIso: T0 });
    await repo.setActive(null);
    expect(await repo.getActive()).toBeNull();
  });

  it("sumByCategory over a range", async () => {
    await repo.createFromDraft({ category: "consume", startIso: T0, endIso: T1 });
    await repo.createFromDraft({
      category: "create",
      startIso: "2026-04-14T14:00:00.000Z",
      endIso: "2026-04-14T14:15:00.000Z",
    });
    const totals = await repo.sumByCategory(
      "2026-04-14T00:00:00.000Z",
      "2026-04-14T23:59:59.999Z",
    );
    expect(totals).toEqual({ consume: 1800, create: 900 });
  });

  it("exportCsvBlob returns a CSV blob with header + row", async () => {
    await repo.createFromDraft({ category: "consume", startIso: T0, endIso: T1 });
    const blob = await repo.exportCsvBlob();
    const text = await blob.text();
    expect(text.split("\r\n")[0]).toBe(
      "id,category,start_iso,end_iso,duration_seconds,notes",
    );
    expect(text).toContain(T0);
  });

  it("exportCsvBlob throws EmptyExportError when no sessions", async () => {
    await expect(repo.exportCsvBlob()).rejects.toBeInstanceOf(EmptyExportError);
  });
});
