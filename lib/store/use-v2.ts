"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getDb } from "@/lib/db/db";
import { bankRepository } from "@/lib/db/bank";
import { pendingResearchRepository } from "@/lib/db/pending-research";
import { prefsRepository } from "@/lib/db/prefs";
import { progressionRepository } from "@/lib/db/progression";
import {
  QueueRepository,
  ResearchQueueRequiresTodoError,
  type QueueDraft,
} from "@/lib/db/queue";
import {
  TodoRepository,
  type TodoDraft,
} from "@/lib/db/todos";
import { currentBalance, liveBalance } from "@/lib/domain/time-bank";
import {
  DEFAULT_PREFS,
  type ActiveSession,
  type BankLedgerEntry,
  type PendingResearchEntry,
  type Prefs,
  type ProgressionState,
  type QueueItem,
  type Todo,
} from "@/lib/db/types";
import { useActiveSession } from "./use-sessions";

const queueRepo = new QueueRepository();
const todoRepo = new TodoRepository();

export function useBankLedger(): BankLedgerEntry[] {
  const rows = useLiveQuery(() => getDb().bankLedger.toArray(), []);
  return useMemo(() => rows ?? [], [rows]);
}

export function useBankBalance(): number {
  const entries = useBankLedger();
  return useMemo(() => currentBalance(entries), [entries]);
}

export function useLiveBankBalance(active: ActiveSession): number {
  const persisted = useBankBalance();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!active || active.category !== "consume" || active.subtype !== "leisure") {
      return;
    }
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [active]);
  return useMemo(() => {
    return liveBalance(persisted, active, new Date().toISOString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persisted, active, tick]);
}

export function useEnsureStarterGrant() {
  useEffect(() => {
    bankRepository.ensureStarterGrant().catch(() => undefined);
  }, []);
}

export function useResetBank() {
  return useCallback(async () => bankRepository.resetToZero(), []);
}

export function useQueueItems(): QueueItem[] {
  const rows = useLiveQuery(() => getDb().queueItems.toArray(), []);
  return useMemo(() => {
    if (!rows) return [];
    return [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [rows]);
}

export function useQueueActions() {
  return useMemo(
    () => ({
      create: (draft: QueueDraft) => queueRepo.create(draft),
      update: (id: string, patch: Partial<QueueDraft>) => queueRepo.update(id, patch),
      delete: (id: string) => queueRepo.delete(id),
      markConsumed: (id: string) => queueRepo.markConsumed(id),
    }),
    [],
  );
}

export function useTodos(): Todo[] {
  const rows = useLiveQuery(() => getDb().todos.toArray(), []);
  return useMemo(() => {
    if (!rows) return [];
    return [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [rows]);
}

export function useTodoActions() {
  return useMemo(
    () => ({
      create: (draft: TodoDraft) => todoRepo.create(draft),
      update: (id: string, patch: Partial<TodoDraft>) => todoRepo.update(id, patch),
      delete: (id: string) => todoRepo.delete(id),
      setStatus: (id: string, status: Todo["status"]) => todoRepo.setStatus(id, status),
    }),
    [],
  );
}

export function usePendingResearch(): PendingResearchEntry[] {
  const rows = useLiveQuery(() => getDb().pendingResearch.toArray(), []);
  return useMemo(() => (rows ?? []).filter((p) => p.status === "pending"), [rows]);
}

export function usePendingResearchByTodo(todoId: string | undefined): PendingResearchEntry[] {
  const all = usePendingResearch();
  return useMemo(() => {
    if (!todoId) return [];
    return all.filter((p) => p.todoId === todoId);
  }, [all, todoId]);
}

export function usePrefs(): Prefs {
  const row = useLiveQuery(() => getDb().prefs.get("prefs"), []);
  useEffect(() => {
    prefsRepository.get().catch(() => undefined);
  }, []);
  return useMemo(() => row ?? DEFAULT_PREFS, [row]);
}

export function usePrefsActions() {
  return useMemo(
    () => ({
      update: (patch: Partial<Omit<Prefs, "id">>) => prefsRepository.update(patch),
    }),
    [],
  );
}

export function useProgression(): ProgressionState {
  const row = useLiveQuery(() => getDb().progression.get("state"), []);
  useEffect(() => {
    progressionRepository.get().catch(() => undefined);
  }, []);
  return (
    row ?? {
      id: "state",
      xp: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastCelebratedLevel: 1,
    }
  );
}

export {
  bankRepository,
  pendingResearchRepository,
  prefsRepository,
  progressionRepository,
  queueRepo as queueRepository,
  todoRepo as todoRepository,
  ResearchQueueRequiresTodoError,
};
