"use client";

import { bankRepository } from "./db/bank";
import { pendingResearchRepository } from "./db/pending-research";
import { prefsRepository } from "./db/prefs";
import { progressionRepository } from "./db/progression";
import { evaluatePending } from "./domain/research-application";
import { entriesForResearchExpiry } from "./domain/time-bank";
import { checkBrokenStreak } from "./domain/progression";
import { sessionRepository } from "./db/sessions";

let booted = false;

export async function bootDataLayer(): Promise<{ expiredCount: number }> {
  if (booted) return { expiredCount: 0 };
  booted = true;

  await prefsRepository.get();
  await bankRepository.ensureStarterGrant();

  let expiredCount = 0;
  try {
    const pending = await pendingResearchRepository.listPending();
    if (pending.length > 0) {
      const recentCreates = await sessionRepository.listAll();
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      const recent = recentCreates.filter(
        (s) => s.category === "create" && s.startIso >= cutoff.toISOString(),
      );
      const { apply, expire } = evaluatePending(
        new Date().toISOString(),
        pending,
        recent,
      );
      for (const a of apply) {
        await pendingResearchRepository.markApplied(a.id);
      }
      for (const e of expire) {
        await pendingResearchRepository.markExpired(e.id);
        await bankRepository.append(entriesForResearchExpiry(e));
        expiredCount += 1;
      }
    }
  } catch (e) {
    console.warn("[picklejuice] research sweep failed", e);
  }

  try {
    const state = await progressionRepository.get();
    const next = checkBrokenStreak(state, new Date().toISOString());
    if (next.currentStreak !== state.currentStreak) {
      await progressionRepository.put(next);
    }
  } catch (e) {
    console.warn("[picklejuice] streak check failed", e);
  }

  return { expiredCount };
}
