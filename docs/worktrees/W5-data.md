# W5 — v2 Data Engine Worktree

**Branch:** `feat/v2-data`
**You own task sections §1, §2, §3, §4, §5.1–5.4, §5.7, §6.1–6.4, §6.9** in `openspec/changes/add-gamification-and-queues/tasks.md`.

## Your job

Build the entire v2 data layer: Dexie v2 migration, Time Bank, queues, todos, research-application, Pomodoro state machine, XP/streak math. Pure logic + Dexie + Vitest. No React. The interfaces you ship are the contract W6 imports against.

## Critical product rule

XP, levels, streaks, and themes are **purely cosmetic**. They MUST NOT grant Time Bank credit, lift Leisure gating, or extend any consume capability. There is no API in this codebase that exchanges progression for time. If you find one, that's a bug — remove it.

## Checklist

### §1 Migration & shared scaffolding

1.1 Bump Dexie schema to v2. Add `subtype` and `linkedItemId` to `sessions`. Add new tables: `queueItems`, `todos`, `bankLedger`, `pendingResearch`, `progression` (single-row), `prefs` (single-row).
1.2 Backfill migration: every existing consume session gets `subtype = "leisure"`, `linkedItemId = undefined`. Test on a Dexie instance pre-populated with v1 data.
1.3 Extend `lib/db/types.ts` with `QueueItem`, `Todo`, `BankLedgerEntry`, `PendingResearchEntry`, `ProgressionState`, `Prefs`, and update `Session` (`subtype?: "research" | "leisure"`, `linkedItemId?: string`).
1.4 Seed default `prefs` row on first boot: `{ earnRatio: 2.0, applyWindowDays: 7, focusMinutes: 25, breakMinutes: 5, streakThresholdMinutes: 10, leisureXp: 1, researchXp: 2, createXp: 3 }`.

### §2 Time Bank engine

2.1 `lib/domain/time-bank.ts` — pure functions:
- `currentBalance(entries: BankLedgerEntry[]): number`
- `entriesForCreateSession(s: Session, ratio: number): BankLedgerEntry[]`
- `entriesForLeisureSession(s: Session): BankLedgerEntry[]`
- `entriesForResearchExpiry(p: PendingResearchEntry): BankLedgerEntry[]`
- `entriesForEdit(prev: Session, next: Session, ratio: number): BankLedgerEntry[]`
- `entriesForDelete(s: Session, ratio: number): BankLedgerEntry[]`

2.2 `lib/db/bank.ts` — append-only ledger writes, idempotent starter-grant seed (key by entry source `"starter-grant"`).
2.3–2.5 Wire bank effects into the existing `DexieSessionRepository` (`createFromDraft`, `update`, `delete`).
2.6 `canStartLeisure(balance: number): boolean`. Throw `LeisureGatedError` if a leisure start is attempted with `balance <= 0`.
2.7 Live-debit ticker — pure function `liveBalance(persistedBalance, activeSession, nowIso)` UI can call once per second.
2.8 Vitest covering: ledger sums, edit/delete reversal correctness, starter-grant idempotency, leisure gating predicate, mid-session-zeroing math.

### §3 Consume Queue + Todos

3.1 `lib/db/queue.ts` repository (CRUD + `listByTag` + `markConsumed`).
3.2 `lib/db/todos.ts` repository (CRUD + status transitions + `recentActivity(todoId, sessions)`).
3.3 Validation: research-tagged queue items require `linkedTodoId`. Throw on save otherwise.
3.4 Vitest for both.

### §4 Research-application

4.1 `lib/db/pending-research.ts` — CRUD over pending entries.
4.2 `lib/domain/research-application.ts` — `evaluatePending(now, pending, recentCreateSessions): { apply, expire }`.
4.3 Hook into `createFromDraft` for Create sessions: any pending research for that `linkedItemId` gets marked applied.
4.4 Background sweep helper `sweepPendingResearch(now)` that returns the bank entries to write and notifications to emit.
4.5 `cancelPendingForSession(sessionId)` called from session delete.
4.6 Vitest for the apply/expire matrix.

### §5 Pomodoro state machine (data parts only)

5.1 Extend `lib/domain/timer.ts` with Pomodoro state on running sessions.
5.2 Auto-stop trigger when focus elapses; emit a `PomodoroComplete` event (typed callback the UI subscribes to).
5.3 Break countdown logic; bank effect during break = none.
5.4 Bank-empty short-circuit during a leisure Pomodoro: stops at the moment the bank hits zero.
5.7 Vitest for the Pomodoro state machine.

### §6 Cosmetic progression (data parts only)

6.1 `lib/domain/progression.ts` — pure XP / level / streak math.
6.2 Hook XP awards into session-saved events.
6.3 Streak evaluator on app boot and after each Create session save.
6.4 `lib/themes/themes.ts` — static array of theme objects.
6.9 Vitest for XP, level boundaries, streak transitions.

## Contract for W6

Document the public surface in this brief or in a top-of-file comment in each module. Names W6 will import against:

- `lib/db/sessions.ts` — extended `SessionRepository`
- `lib/db/bank.ts` — `BankRepository` (`getBalance`, `subscribe`, `liveBalance`)
- `lib/db/queue.ts` — `QueueRepository`
- `lib/db/todos.ts` — `TodoRepository`
- `lib/db/pending-research.ts` — `PendingResearchRepository`
- `lib/domain/progression.ts` — `addXp`, `evaluateStreak`, `xpForLevel`, `levelForXp`
- `lib/themes/themes.ts` — `THEMES`, `themeById`
- `lib/db/prefs.ts` — `PrefsRepository`

If your shape diverges from anything in `docs/worktrees/W6-ui.md`, update both that file and this one in the same commit.

## What you must NOT do

- No React components. No JSX.
- No edits to `openspec/**`. W4 owns specs.
- No edits to task sections you don't own.

## Reference reading

- `openspec/changes/add-gamification-and-queues/proposal.md`
- All 7 v2 spec files
- `lib/db/types.ts`, `lib/db/sessions.ts`, `lib/domain/timer.ts` (current v1 code)
- `docs/worktrees/W6-ui.md` (the imports W6 expects)
