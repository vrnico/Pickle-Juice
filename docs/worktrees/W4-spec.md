# W4 — v2 Specs Worktree

**Branch:** `specs/v2-gamification`
**You own task section §11** in `openspec/changes/add-gamification-and-queues/tasks.md`.

## Your job

You are the keeper of the v2 contract. W5 (data) and W6 (UI) are building against the spec you finalize. Your goal: tighten every requirement, make sure every scenario is walkable by a human, and produce a manual test plan rows-1:1 with the spec scenarios.

## Checklist (section §11)

1. **Validate strict** — `openspec validate add-gamification-and-queues --strict`. Resolve any errors.
2. **Read every spec top to bottom** — there are 7 spec files under `openspec/changes/add-gamification-and-queues/specs/`:
   - `core-tracking/spec.md` (modified)
   - `time-bank/spec.md`
   - `consume-queue/spec.md`
   - `create-todos/spec.md`
   - `research-application/spec.md`
   - `pomodoro-mode/spec.md`
   - `cosmetic-progression/spec.md`
   - `share-and-bookmarklet/spec.md`
3. **Audit for gaps** — ask:
   - Does every user-visible behavior have at least one scenario?
   - Are negative paths covered (empty bank, expired research, deleted linked todo, etc.)?
   - Is the cosmetic-only rule re-stated explicitly enough that no implementation could "accidentally" let XP unlock time?
4. **Extend the manual test plan** (`docs/manual-test-plan.md`) — append rows for every new scenario. Group by capability, mirror the scenario titles. Use the same columns as v1: `Scenario | Steps | Expected | Passed?`.
5. **Re-validate strict after edits.**
6. Commit and push your branch. Notify the user so W5/W6 can rebase.

## What you must NOT do

- No implementation. No data layer. No React.
- Don't edit task sections you don't own.
- Don't soften "SHALL"/"MUST" to "should"/"may".

## Coordination

If W5 or W6 finds a spec gap, fix it here, re-validate, push, and tell the user so the others can rebase. Don't let either worktree fork the spec.

## Reference reading

- `openspec/project.md`
- `openspec/changes/add-gamification-and-queues/proposal.md`
- All 7 spec files under `openspec/changes/add-gamification-and-queues/specs/`
- `openspec/changes/add-gamification-and-queues/tasks.md`
