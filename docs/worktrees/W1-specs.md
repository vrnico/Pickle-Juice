# W1 — Specs Worktree

**Branch:** `specs/core-tracking`
**You own task section §5** in `openspec/changes/add-core-tracking/tasks.md`.

## Your job

You are the keeper of the contract. W2 and W3 are building against the spec you finalize. Your goal: make the spec tight, validated, and humanly testable — then stop and let the implementation worktrees finish.

## Checklist (section §5 of tasks.md)

1. **Validate the change** — run `openspec validate add-core-tracking --strict`. Fix any errors. Re-run until clean.
2. **Review the spec for gaps** — read `openspec/changes/add-core-tracking/specs/core-tracking/spec.md` top to bottom. Ask yourself:
   - Is every user-visible behavior covered by at least one scenario?
   - Are edge cases (empty states, validation errors, offline, interrupted sessions) covered?
   - Any requirement that uses "should" or "may"? Upgrade to SHALL/MUST if it's normative.
3. **Write `docs/manual-test-plan.md`** — one row per scenario, columns: `Scenario | Steps | Expected | Passed? (Y/N/date)`. Pull scenarios directly from the spec so it's 1:1.
4. **Re-validate after any spec edits.**
5. Commit and push your branch. Notify the user so W2/W3 can rebase onto your changes.

## What you must NOT do

- Do not start implementing UI, data, or PWA code. That's W2 and W3.
- Do not edit `tasks.md` sections other than §5 (other worktrees own theirs).
- Do not rewrite `project.md` without flagging the change to the user first.

## Coordination

- If you find a spec gap that blocks W2 or W3, fix it in the spec **here**, re-validate, push, and post the change to the user so they can tell other worktrees to rebase.
- Once §5 tasks are checked off, stop. Don't poke at W2/W3 work.

## Reference reading before you start

- `openspec/project.md`
- `openspec/changes/add-core-tracking/proposal.md`
- `openspec/changes/add-core-tracking/specs/core-tracking/spec.md`
- `openspec/changes/add-core-tracking/tasks.md`
