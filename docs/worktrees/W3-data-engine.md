# W3 — Data Engine Worktree

**Branch:** `feat/data-engine`
**You own task section §2** in `openspec/changes/add-core-tracking/tasks.md`.

## Your job

Own every bit of persistence and domain logic: Dexie schema, the session repository, the active-session state machine, recovery of interrupted sessions, aggregations, and CSV export. W2 will consume your `lib/db/sessions.ts` — the interface you ship is the contract.

## Checklist (section §2)

2.1 Install Dexie. Define database `picklejuice` (version 1) in `lib/db/db.ts` with one `sessions` table. Schema fields:
   - `id` (UUID string, primary key)
   - `category` ("consume" | "create", indexed)
   - `startIso` (ISO-8601 string, indexed)
   - `endIso` (ISO-8601 string)
   - `durationSeconds` (integer)
   - `notes` (string, optional)
   - `createdAt`, `updatedAt` (ISO strings)

   Also store the active session in a separate `meta` table (or in `localStorage`) so we can recover on reload.

2.2 Implement the `SessionRepository` at `lib/db/sessions.ts` with the interface documented in `docs/worktrees/W2-pwa-ui.md`. Exact function signatures matter — W2 is coding against them.

2.3 Active-session state machine — pure functions in `lib/domain/timer.ts`:
   - States: `idle`, `running`.
   - Events: `start(category)`, `stop(nowIso)`, `cancelUnderThreshold(nowIso)`.
   - Persist transitions via `SessionRepository.setActive`.

2.4 Interrupted-session recovery — when the app boots with `getActive()` returning non-null, expose a helper `describeInterruptedSession(active, now)` that returns `{ elapsedSeconds, category, startIso }` for the UI's recovery prompt. Also expose `endInterruptedNow(active, nowIso)` and `keepRunning(active)`.

2.5 Implement the "stop under 1 second discards" rule inside the timer state machine, not in the UI — the UI should just call `stop()` and get either a saved session back or `null`.

2.6 CSV export in `lib/export/csv.ts`:
   - `exportCsvBlob(): Promise<Blob>`
   - Columns in this order: `id,category,start_iso,end_iso,duration_seconds,notes`
   - Escape commas, quotes, and newlines per RFC 4180
   - Return `null` (or throw a typed empty error) if zero sessions — W2 shows the empty-state message

2.7 Aggregation helpers in `lib/domain/aggregate.ts`:
   - `sumByCategory(startIso, endIso): Record<Category, number>` (seconds)
   - `ratioForDay(date): { consume: number; create: number; totalSeconds: number }`
   - `ratioForLast7Days(): same shape`

2.8 Unit tests (Vitest) under `lib/**/__tests__/`:
   - Repository round-trip (create → read → update → delete)
   - State machine transitions, including invalid transitions
   - Interrupted-session recovery
   - "Stop under 1 second discards" rule
   - CSV escaping edge cases (commas, quotes, newlines, unicode)
   - Aggregation math against a fixture set of sessions

## Contract rules

- **Your interface is the contract.** If the shape in `W2-pwa-ui.md` is wrong, update that brief and ping the user — don't silently diverge.
- **IndexedDB only.** No localStorage for session data (only for the tiny active-session pointer, which is acceptable).
- **Every public function is pure or has a clear async boundary.** Timer logic must be unit-testable without a browser.

## What you must NOT do

- Do not build UI. No React components. Your deliverables are `lib/**` and tests.
- Do not edit `openspec/**`. Specs are owned by W1.
- Do not add a backend, network calls, or telemetry.

## Reference reading before you start

- `openspec/project.md`
- `openspec/changes/add-core-tracking/proposal.md`
- `openspec/changes/add-core-tracking/specs/core-tracking/spec.md`
- `docs/worktrees/W2-pwa-ui.md` (the interface W2 expects from you)
- `ROADMAP.md`
