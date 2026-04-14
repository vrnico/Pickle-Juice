# Pickle Juice — Parallel Build Roadmap

This project uses **three parallel Claude sessions** running in separate terminals against separate git branches. The OpenSpec change `add-core-tracking` is the shared contract; each worktree picks up a numbered section of `openspec/changes/add-core-tracking/tasks.md`.

## The three worktrees

| ID | Branch | Scope | Task sections | Brief |
|----|--------|-------|---------------|-------|
| **W1** | `specs/core-tracking` | Specs, validation, manual test plan | §5 | [`docs/worktrees/W1-specs.md`](docs/worktrees/W1-specs.md) |
| **W2** | `feat/pwa-ui` | UI, PWA shell, Vercel deploy | §1, §3, §4, §6 | [`docs/worktrees/W2-pwa-ui.md`](docs/worktrees/W2-pwa-ui.md) |
| **W3** | `feat/data-engine` | Dexie schema, domain logic, aggregation, CSV | §2 | [`docs/worktrees/W3-data-engine.md`](docs/worktrees/W3-data-engine.md) |

W1 runs slightly ahead: it locks the spec so W2 and W3 aren't chasing a moving target. W2 and W3 are truly parallel — they only touch each other at the `lib/db/sessions.ts` interface, which is defined in the spec.

## One-time setup (from the repo root)

```bash
cd /mnt/e/LTC_GARBAGE/413_WEEKPROJECT/PickleJuice
git init
git add .
git commit -m "Initial OpenSpec scaffolding for add-core-tracking"
git branch specs/core-tracking
git branch feat/pwa-ui
git branch feat/data-engine

# Create three worktrees
git worktree add ../PickleJuice-W1-specs       specs/core-tracking
git worktree add ../PickleJuice-W2-pwa-ui      feat/pwa-ui
git worktree add ../PickleJuice-W3-data-engine feat/data-engine
```

## Spawning the three Claude sessions

Open **three separate terminal tabs/windows** and in each one:

```bash
# Terminal 1 — W1 (specs)
cd /mnt/e/LTC_GARBAGE/PickleJuice-W1-specs
claude "Read docs/worktrees/W1-specs.md and work that brief."

# Terminal 2 — W2 (PWA UI)
cd /mnt/e/LTC_GARBAGE/PickleJuice-W2-pwa-ui
claude "Read docs/worktrees/W2-pwa-ui.md and work that brief."

# Terminal 3 — W3 (data engine)
cd /mnt/e/LTC_GARBAGE/PickleJuice-W3-data-engine
claude "Read docs/worktrees/W3-data-engine.md and work that brief."
```

Each worktree brief tells that Claude exactly which task section to check off, what the contract is with the other worktrees, and when to stop and wait.

## Merge flow

1. **W1 first** — merge `specs/core-tracking` into `main` once spec is validated and manual test plan is written. W2/W3 rebase onto the updated main.
2. **W3 before W2** — merge the data engine next so the UI has a real `lib/db/sessions.ts` to import. W2 can mock against the interface until then.
3. **W2 last** — merge the PWA UI, then promote the Vercel deploy.
4. **Archive** — `openspec archive add-core-tracking` moves the change into `openspec/specs/core-tracking/` as the new source of truth.

## Coordination rules

- **Do not edit `openspec/changes/add-core-tracking/specs/` outside W1.** If W2/W3 find a spec gap, open an issue or ping W1 — don't fork the spec.
- **The `SessionRepository` interface in `lib/db/sessions.ts` is owned by W3.** W2 imports from it; if the shape needs to change, W3 edits it.
- **Rebase daily, merge small.** Three worktrees diverging for a week will be painful to reconcile.
- **Each worktree updates its own task checkboxes** in `openspec/changes/add-core-tracking/tasks.md` in its own commits; conflicts on that file are trivial to resolve.

## Definition of done for v1

- `openspec validate add-core-tracking` passes
- Every scenario in `specs/core-tracking/spec.md` walked by hand on a Vercel preview and checked off in `docs/manual-test-plan.md`
- Lighthouse PWA installability passing
- App works fully offline after first load
- `openspec archive add-core-tracking` run and committed
