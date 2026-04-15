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
  ConsumeSubtype,
  DraftSession,
  Session,
} from "@/lib/db/types";
import {
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

export function useActiveSession(): ActiveSession {
  const row = useLiveQuery(() => getDb().meta.get("active_session"), []);
  return useMemo(() => {
    if (!row) return null;
    try {
      return JSON.parse(row.value) as ActiveSession;
    } catch {
      return null;
    }
  }, [row]);
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
    return timer.elapsedSeconds(timer.fromActive(active), nowIso());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, tick]);
}

export function usePomodoroSecondsRemaining(active: ActiveSession): number | null {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!active?.pomodoro) return;
    const id = setInterval(() => setTick((t) => t + 1), 500);
    return () => clearInterval(id);
  }, [active]);
  return useMemo(() => {
    if (!active?.pomodoro) return null;
    return timer.pomodoroSecondsRemaining(timer.fromActive(active), nowIso());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, tick]);
}

export interface StartAttempt {
  ok: boolean;
  alreadyActive?: ActiveSession;
  blocked?: "leisure-empty";
}

export interface StartArgs {
  category: Category;
  subtype?: ConsumeSubtype;
  linkedItemId?: string;
  pomodoro?: { focusMinutes: number; breakMinutes: number };
}

export function useTimerActions() {
  const active = useActiveSession();

  const start = useCallback(
    async (args: StartArgs, opts?: { bankBalance?: number }): Promise<StartAttempt> => {
      if (active) return { ok: false, alreadyActive: active };
      const isLeisure = args.category === "consume" && args.subtype === "leisure";
      if (isLeisure && opts?.bankBalance !== undefined && opts.bankBalance <= 0) {
        return { ok: false, blocked: "leisure-empty" };
      }
      const newActive: ActiveSession = {
        category: args.category,
        subtype: args.subtype,
        linkedItemId: args.linkedItemId,
        startIso: nowIso(),
        pomodoro: args.pomodoro
          ? {
              focusMinutes: args.pomodoro.focusMinutes,
              breakMinutes: args.pomodoro.breakMinutes,
              phase: "focus",
              phaseStartIso: nowIso(),
            }
          : undefined,
      };
      await repo.setActive(newActive);
      return { ok: true };
    },
    [active],
  );

  const stop = useCallback(async (): Promise<Session | null> => {
    if (!active) return null;
    const result = timer.stop(timer.fromActive(active), nowIso());
    await repo.setActive(null);
    if (!result.draft) return null;
    return repo.createFromDraft(result.draft);
  }, [active]);

  const endInterruptedNow = useCallback(async (): Promise<Session | null> => {
    return stop();
  }, [stop]);

  return { start, stop, endInterruptedNow };
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
