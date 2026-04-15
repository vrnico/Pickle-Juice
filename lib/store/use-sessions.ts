"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getDb } from "@/lib/db/db";
import {
  DexieSessionRepository,
  EmptyExportError,
} from "@/lib/db/sessions";
import type {
  ActiveSession,
  Category,
  DraftSession,
  Session,
} from "@/lib/db/types";
import {
  dayRangeIso,
  last7DaysRangeIso,
  ratioForDay,
  ratioForLast7Days,
  type RatioSummary,
} from "@/lib/domain/aggregate";
import * as timer from "@/lib/domain/timer";
import { exportFilename } from "@/lib/export/csv";

const repo = new DexieSessionRepository();

function nowIso() {
  return new Date().toISOString();
}

export function useAllSessions(): Session[] {
  const rows = useLiveQuery(() => getDb().sessions.toArray(), []);
  return useMemo(() => {
    if (!rows) return [];
    return [...rows].sort((a, b) => b.startIso.localeCompare(a.startIso));
  }, [rows]);
}

export function useActiveSession(): {
  active: ActiveSession;
  loading: boolean;
} {
  const row = useLiveQuery(() => getDb().meta.get("active_session"), []);
  const loading = row === undefined;
  const active: ActiveSession = useMemo(() => {
    if (!row) return null;
    try {
      return JSON.parse(row.value) as ActiveSession;
    } catch {
      return null;
    }
  }, [row]);
  return { active, loading };
}

export function useElapsedSeconds(active: ActiveSession): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setTick((t) => t + 1), 500);
    return () => clearInterval(id);
  }, [active]);
  return useMemo(() => {
    if (!active) return 0;
    return timer.elapsedSeconds(
      { kind: "running", category: active.category, startIso: active.startIso },
      nowIso(),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, tick]);
}

export interface StartAttempt {
  ok: boolean;
  alreadyActive?: ActiveSession;
}

export function useTimerActions() {
  const { active } = useActiveSession();

  const start = useCallback(
    async (category: Category): Promise<StartAttempt> => {
      if (active) return { ok: false, alreadyActive: active };
      await repo.setActive({ category, startIso: nowIso() });
      return { ok: true };
    },
    [active],
  );

  const stop = useCallback(async (): Promise<Session | null> => {
    if (!active) return null;
    const result = timer.stop(
      { kind: "running", category: active.category, startIso: active.startIso },
      nowIso(),
    );
    await repo.setActive(null);
    if (!result.draft) return null;
    return repo.createFromDraft(result.draft);
  }, [active]);

  const keepRunning = useCallback(async () => {
    // no-op: simply preserve the active row
  }, []);

  const endInterruptedNow = useCallback(async (): Promise<Session | null> => {
    return stop();
  }, [stop]);

  return { start, stop, keepRunning, endInterruptedNow };
}

export function useSessionActions() {
  const update = useCallback(
    (id: string, patch: Partial<DraftSession>) => repo.update(id, patch),
    [],
  );
  const remove = useCallback((id: string) => repo.delete(id), []);
  return { update, remove };
}

export function useTodaysRatio(sessions: Session[]): RatioSummary {
  return useMemo(() => ratioForDay(sessions, new Date()), [sessions]);
}

export function useLast7DaysRatio(sessions: Session[]): RatioSummary {
  return useMemo(() => ratioForLast7Days(sessions, new Date()), [sessions]);
}

export async function exportSessionsCsv(): Promise<string | null> {
  try {
    const blob = await repo.exportCsvBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = exportFilename(new Date());
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return a.download;
  } catch (e) {
    if (e instanceof EmptyExportError) return null;
    throw e;
  }
}

export { dayRangeIso, last7DaysRangeIso };
