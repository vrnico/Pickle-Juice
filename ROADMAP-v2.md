# Pickle Juice v2 — Parallel Build Roadmap

v2 turns Pickle Juice from a passive ledger into a behavior loop: time-bank gating, queues, todos, optional Pomodoro, cosmetic progression, and Web Share Target. The OpenSpec change is `add-gamification-and-queues` (7 capability spec files, 1 modified).

Same playbook as v1: three parallel git worktrees, one Claude session per worktree.

## The three worktrees

| ID | Branch | Scope | Task sections | Brief |
|----|--------|-------|---------------|-------|
| **W4** | `specs/v2-gamification` | Validate the change strict, extend the manual test plan, walk scenarios on preview | §11 | [`docs/worktrees/W4-spec.md`](docs/worktrees/W4-spec.md) |
| **W5** | `feat/v2-data` | Dexie v2 migration, Time Bank, queue/todos repos, research-application, Pomodoro state machine, XP/streak math, all lib/* + Vitest | §1–§4, §5.1–5.4, §5.7, §6.1–6.4, §6.9 | [`docs/worktrees/W5-data.md`](docs/worktrees/W5-data.md) |
| **W6** | `feat/v2-ui` | Home redesign, pickers, queue/todos screens, Pomodoro UI, themes + Profile, Share Target, bookmarklet, Settings additions | §5.5–5.6, §6.5–6.8, §7–§10 | [`docs/worktrees/W6-ui.md`](docs/worktrees/W6-ui.md) |

W4 (specs) is light — it can run alongside W5 from day one. W6 (UI) needs W5's `lib/db/types.ts` (extended types) and at least the bank repository surface; everything else W6 can mock against the documented interface until W5 merges.

## One-time setup (from the repo root)

```bash
cd /mnt/e/LTC_GARBAGE/413_WEEKPROJECT/PickleJuice

git branch specs/v2-gamification
git branch feat/v2-data
git branch feat/v2-ui

git worktree add ../Pickle-Juice-W4-spec specs/v2-gamification
git worktree add ../Pickle-Juice-W5-data feat/v2-data
git worktree add ../Pickle-Juice-W6-ui   feat/v2-ui
```

## Spawning the three Claude sessions

```bash
# Terminal 1 — W4 (specs)
cd /mnt/e/LTC_GARBAGE/413_WEEKPROJECT/Pickle-Juice-W4-spec
claude "Read docs/worktrees/W4-spec.md and work that brief."

# Terminal 2 — W5 (data engine)
cd /mnt/e/LTC_GARBAGE/413_WEEKPROJECT/Pickle-Juice-W5-data
claude "Read docs/worktrees/W5-data.md and work that brief."

# Terminal 3 — W6 (UI)
cd /mnt/e/LTC_GARBAGE/413_WEEKPROJECT/Pickle-Juice-W6-ui
claude "Read docs/worktrees/W6-ui.md and work that brief."
```

## Merge flow

1. **W4 first** — once the change validates strict and the manual test plan is extended, merge `specs/v2-gamification` → `main`. W5 and W6 rebase.
2. **W5 next** — merge `feat/v2-data` → `main` so W6 has the real Time Bank, queue, and todos APIs to import.
3. **W6 last** — merge `feat/v2-ui` → `main`, run the full manual test plan on a Vercel preview, promote to production, then `openspec archive add-gamification-and-queues`.

## Coordination rules

- **Spec is owned by W4.** If W5 or W6 hits a spec gap, they ping the user; W4 patches the spec, re-validates, pushes; W5/W6 rebase.
- **Data layer is owned by W5.** The interfaces W5 ships in `lib/db/*.ts`, `lib/domain/*.ts`, and `lib/themes/*.ts` are the contract. W6 must not duplicate persistence, math, or business rules.
- **UI is owned by W6.** No React components, hooks, or screens in W5.
- **Don't break v1.** Existing v1 sessions must continue to work after the v2 migration. W5 owns the migration path; W6 must accept that legacy sessions arrive with `subtype = "leisure"` and `linkedItemId = undefined`.
- **No XP-for-time conversions, ever.** This is a hard product rule. Any code or UI suggesting XP/streaks/levels can be cashed in for consume time is a bug. Cosmetic only.

## Definition of done for v2

- `openspec validate add-gamification-and-queues --strict` passes
- Every scenario across all 7 capability spec files is in `docs/manual-test-plan.md` and walked by hand on a Vercel preview
- v1 user with existing sessions migrates cleanly: their consume sessions show as Leisure, bank starts at 60 min, no data lost
- Time Bank earns, debits, and gates as specified
- Research-application cycle works end-to-end (free, applied, expired, refunded)
- Pomodoro mode toggles, focuses, breaks, and respects bank gating
- Cosmetic theme swap works without affecting data
- Share Target works on Android Chrome from a real device
- `openspec archive add-gamification-and-queues` run and committed
