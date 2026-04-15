import type { PendingResearchEntry, Session } from "../db/types";

export interface EvaluationResult {
  apply: PendingResearchEntry[];
  expire: PendingResearchEntry[];
}

export function evaluatePending(
  nowIso: string,
  pending: PendingResearchEntry[],
  recentCreateSessions: Session[],
): EvaluationResult {
  const todoIdsWithCreate = new Set(
    recentCreateSessions
      .filter((s) => s.category === "create" && s.linkedItemId)
      .map((s) => s.linkedItemId as string),
  );
  const apply: PendingResearchEntry[] = [];
  const expire: PendingResearchEntry[] = [];
  for (const p of pending) {
    if (p.status !== "pending") continue;
    if (todoIdsWithCreate.has(p.todoId)) {
      apply.push(p);
      continue;
    }
    if (p.deadline <= nowIso) {
      expire.push(p);
    }
  }
  return { apply, expire };
}
