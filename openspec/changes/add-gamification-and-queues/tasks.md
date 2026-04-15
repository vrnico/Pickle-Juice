## 1. Migration & shared scaffolding

- [x] 1.1 Bump Dexie schema to v2 — add `subtype` and `linkedItemId` columns to `sessions`, add new tables `queueItems`, `todos`, `bankLedger`, `pendingResearch`, `progression`, `prefs`
- [x] 1.2 Backfill migration — set `subtype = "leisure"` on every existing consume session; leave `linkedItemId` undefined
- [x] 1.3 Define shared TypeScript types in `lib/db/types.ts` for `QueueItem`, `Todo`, `BankLedgerEntry`, `PendingResearchEntry`, `ProgressionState`, `Prefs`, and the extended `Session`
- [x] 1.4 Seed default `prefs` row on first boot (earnRatio=2.0, applyWindowDays=7, focusMinutes=25, breakMinutes=5, streakThresholdMinutes=10, leisureXp=1, researchXp=2, createXp=3)

## 2. Time Bank engine (W-data)

- [x] 2.1 Implement `lib/domain/time-bank.ts` — pure functions over ledger entries: `currentBalance(entries)`, `entriesForCreateSession(s, ratio)`, `entriesForLeisureSession(s)`, `entriesForResearchExpiry(p)`, `entriesForEdit(prev, next, ratio)`, `entriesForDelete(s, ratio)`
- [x] 2.2 Implement `lib/db/bank.ts` repository — append-only ledger writes, current-balance subscription, starter-grant idempotent seed
- [x] 2.3 Wire bank earn into `createFromDraft` for Create sessions
- [x] 2.4 Wire bank debit into `createFromDraft` for Leisure consume sessions
- [x] 2.5 Wire compensating entries on `update` and `delete`
- [x] 2.6 Implement leisure-gating predicate `canStartLeisure(balance)`; throw a typed error if attempted with empty bank
- [x] 2.7 Implement live-debit ticker — recompute displayed balance each second during an active leisure session
- [x] 2.8 Vitest: ledger sums, edit/delete reversal, starter-grant idempotency, leisure gating, mid-session zeroing

## 3. Consume Queue + Todos data layer (W-data)

- [x] 3.1 `lib/db/queue.ts` repository — CRUD, list grouped by tag, mark consumed
- [x] 3.2 `lib/db/todos.ts` repository — CRUD, status transitions, recent-activity rollup per todo
- [x] 3.3 Validation: research-tagged queue items require a `linkedTodoId`; reject otherwise
- [x] 3.4 Vitest for both repositories

## 4. Research-application logic (W-data)

- [x] 4.1 `lib/db/pending-research.ts` repository — append a pending entry on Research session save, list pending by todo, mark applied, list expired
- [x] 4.2 `lib/domain/research-application.ts` — `evaluatePending(now, pending, recentCreateSessions)` returns `{ apply: [...], expire: [...] }`
- [x] 4.3 Hook: when a Create session is saved with a `linkedItemId`, mark all pending research for that todo as `applied`
- [x] 4.4 Background expiry sweep — on app boot and once per hour while open, evaluate pending entries, post expired entries as bank debits, surface notifications via an in-app notification queue
- [x] 4.5 Cancel pending entry on session delete
- [x] 4.6 Vitest for the apply/expire matrix

## 5. Pomodoro mode (W-data + W-ui)

- [x] 5.1 Extend `lib/domain/timer.ts` with Pomodoro state: `pomodoro: { focusMinutes, breakMinutes, phase: "focus" | "break" }` attached to running sessions
- [x] 5.2 Auto-stop logic when the focus block elapses; emits a `PomodoroComplete` event the UI subscribes to
- [x] 5.3 Break countdown, no bank effect during break
- [x] 5.4 Bank-empty short-circuit during a leisure Pomodoro
- [x] 5.5 Settings UI for focus/break lengths
- [x] 5.6 Home toggle for Pomodoro mode persists in `prefs`
- [x] 5.7 Vitest for the Pomodoro state machine

## 6. Cosmetic progression (W-data + W-ui)

- [x] 6.1 `lib/domain/progression.ts` — pure XP / level / streak math; level table at fixed thresholds (e.g. 0/100/300/600/1000/1500/…)
- [x] 6.2 Hook XP awards into session-saved events
- [x] 6.3 Streak evaluator runs on app boot and after each Create session save
- [x] 6.4 `lib/themes/themes.ts` — static array of theme objects (id, name, palette CSS variables, unlocked-at-level)
- [x] 6.5 Settings → Themes UI: grid of unlocked vs. locked themes with selection
- [x] 6.6 Apply selected theme via CSS-variable swap on `<html>`
- [x] 6.7 Profile screen — XP, level + progress bar, current streak, longest streak, themes grid, "How this works" disclosure
- [ ] 6.8 Level-up celebration overlay (one-time per level)
- [x] 6.9 Vitest for XP, level boundaries, streak transitions

## 7. UI shell + pickers (W-ui)

- [x] 7.1 Home screen redesign — bank pill, Pomodoro toggle, Consume button → consume picker, Create button → create picker
- [x] 7.2 Consume picker — Research vs Leisure tabs, list queue items, "Freestyle" option asks for subtype
- [x] 7.3 Create picker — pending + in-progress todos, "Freestyle" option
- [x] 7.4 Active-session view shows Pomodoro countdown when applicable
- [x] 7.5 End-of-Pomodoro modal: take break / stop
- [x] 7.6 End-of-Create-session prompt: mark linked todo done?
- [x] 7.7 Mid-leisure bank-empty modal: stops session, explains why

## 8. Queue + Todos screens (W-ui)

- [x] 8.1 Queue screen — grouped by tag, add/edit/delete dialogs
- [x] 8.2 Todos screen — grouped by status, add/edit/delete dialogs, recent-activity panel per todo
- [x] 8.3 Pending-research badges on todos and Profile

## 9. Share Target + bookmarklet (W-ui)

- [x] 9.1 Update `public/manifest.webmanifest` with `share_target` entry pointing to `/share`
- [x] 9.2 Implement `app/share/page.tsx` — reads query params, prefills add-to-queue form, defaults tag to Leisure
- [x] 9.3 Settings → "Add to Pickle Juice" bookmarklet — generated from the current location's origin, copy-to-clipboard + drag-to-bookmarks-bar UI

## 10. Settings additions (W-ui)

- [x] 10.1 Earn ratio slider (1.0–5.0)
- [x] 10.2 Apply window slider (1–30 days)
- [x] 10.3 Pomodoro focus + break length inputs
- [x] 10.4 Streak threshold input
- [x] 10.5 Themes grid (mirrors Profile)
- [x] 10.6 "Reset Time Bank" destructive action with confirmation

## 11. Specs & verification (W-spec)

- [x] 11.1 `openspec validate add-gamification-and-queues --strict` passes
- [x] 11.2 Extend `docs/manual-test-plan.md` with rows for every new scenario across all 7 capability spec files
- [ ] 11.3 Walk every new scenario by hand on a Vercel preview before archiving

## 12. Ship

- [ ] 12.1 Promote v2 preview to production
- [ ] 12.2 `openspec archive add-gamification-and-queues`
