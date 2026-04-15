import { v4 as uuid } from "uuid";
import type {
  ActiveSession,
  BankLedgerEntry,
  BankLedgerSource,
  PendingResearchEntry,
  Session,
} from "../db/types";

function nowIso() {
  return new Date().toISOString();
}

function minutes(seconds: number): number {
  return seconds / 60;
}

function entry(
  amount: number,
  source: BankLedgerSource,
  refId?: string,
  note?: string,
): BankLedgerEntry {
  return {
    id: uuid(),
    ts: nowIso(),
    amount: Math.round(amount * 100) / 100,
    source,
    refId,
    note,
  };
}

export function currentBalance(entries: BankLedgerEntry[]): number {
  return entries.reduce((sum, e) => sum + e.amount, 0);
}

export function entriesForCreateSession(s: Session, ratio: number): BankLedgerEntry[] {
  if (s.category !== "create") return [];
  return [entry(minutes(s.durationSeconds) * ratio, "create-session", s.id)];
}

export function entriesForLeisureSession(s: Session): BankLedgerEntry[] {
  if (s.category !== "consume" || s.subtype !== "leisure") return [];
  return [entry(-minutes(s.durationSeconds), "leisure-session", s.id)];
}

export function entriesForResearchExpiry(p: PendingResearchEntry): BankLedgerEntry[] {
  return [entry(-p.minutes, "research-expiry", p.id, "Unapplied research")];
}

export function entriesForEdit(
  prev: Session,
  next: Session,
  ratio: number,
): BankLedgerEntry[] {
  const reversal = reverseEntries(prev, ratio);
  const reapply = applyEntries(next, ratio);
  return [...reversal, ...reapply];
}

export function entriesForDelete(s: Session, ratio: number): BankLedgerEntry[] {
  return reverseEntries(s, ratio);
}

function reverseEntries(s: Session, ratio: number): BankLedgerEntry[] {
  if (s.category === "create") {
    return [entry(-minutes(s.durationSeconds) * ratio, "delete-compensate", s.id)];
  }
  if (s.category === "consume" && s.subtype === "leisure") {
    return [entry(minutes(s.durationSeconds), "delete-compensate", s.id)];
  }
  return [];
}

function applyEntries(s: Session, ratio: number): BankLedgerEntry[] {
  if (s.category === "create") {
    return [entry(minutes(s.durationSeconds) * ratio, "edit-compensate", s.id)];
  }
  if (s.category === "consume" && s.subtype === "leisure") {
    return [entry(-minutes(s.durationSeconds), "edit-compensate", s.id)];
  }
  return [];
}

export function liveBalance(
  persistedBalance: number,
  active: ActiveSession,
  nowIsoStr: string,
): number {
  if (!active) return persistedBalance;
  if (active.category !== "consume" || active.subtype !== "leisure") {
    return persistedBalance;
  }
  const elapsedMin =
    (new Date(nowIsoStr).getTime() - new Date(active.startIso).getTime()) / 60_000;
  return persistedBalance - elapsedMin;
}

export class LeisureGatedError extends Error {
  constructor(public readonly minutesNeeded: number) {
    super(`Leisure consume is gated. Earn ${minutesNeeded.toFixed(0)} more minutes.`);
    this.name = "LeisureGatedError";
  }
}

export function canStartLeisure(balance: number): boolean {
  return balance > 0;
}

export function entryStarterGrant(amount: number): BankLedgerEntry {
  return entry(amount, "starter-grant", undefined, "Welcome to Pickle Juice");
}

export function entryManualReset(currentBalanceMin: number): BankLedgerEntry {
  return entry(-currentBalanceMin, "manual-reset", undefined, "User reset bank");
}
