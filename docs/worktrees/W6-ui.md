# W6 — v2 UI Worktree

**Branch:** `feat/v2-ui`
**You own task sections §5.5, §5.6, §6.5, §6.6, §6.7, §6.8, §7, §8, §9, §10** in `openspec/changes/add-gamification-and-queues/tasks.md`.

## Your job

Build every screen, picker, modal, and bookmarklet for v2. You consume the data layer W5 ships — never reimplement persistence, math, or business rules in components.

## Critical product rule

XP, levels, streaks, and themes are **purely cosmetic**. No UI affordance — no button, no settings toggle, no celebration overlay — may suggest progression converts to consume time. Profile must include the "How this works" disclosure.

## Checklist

### §5.5–5.6 Pomodoro UI

5.5 Settings → focus minutes (5–60) and break minutes (1–30) inputs, persist via `PrefsRepository`.
5.6 Home Pomodoro toggle, persists in `prefs`.

### §6.5–6.8 Cosmetic progression UI

6.5 Settings → Themes grid showing unlocked vs. locked themes (locked tiles show "Reach level N").
6.6 Apply selected theme via CSS-variable swap on `<html>`. Persist selection in `prefs`.
6.7 Profile screen — XP, current level + progress bar to next level, current streak, longest streak, themes grid, expandable "How this works" disclosure.
6.8 One-time level-up celebration overlay when crossing a level threshold (track `lastCelebratedLevel` in `prefs`).

### §7 UI shell + pickers

7.1 Home redesign:
   - Top: bank pill ("Bank: 32 min", click → Profile).
   - Middle: Consume + Create buttons.
   - Below buttons: Pomodoro toggle.
7.2 Consume picker (modal): Research vs Leisure tabs, list queue items in each tab, "Freestyle" option at the bottom of each tab. Picking a research item without a linked todo is impossible (validated in W5).
7.3 Create picker (modal): pending + in-progress todos, "Freestyle" option.
7.4 Active-session view: when Pomodoro is on, show the focus countdown (mm:ss) and a small ring/bar; when off, show the v1 elapsed timer.
7.5 End-of-Pomodoro modal: "Take a 5-minute break" / "Stop session".
7.6 End-of-Create-session prompt: if linked to a todo, ask "Mark this todo done?".
7.7 Mid-leisure bank-empty modal: explains the session ended because the bank ran out, links to Create.

### §8 Queue + Todos screens

8.1 Queue screen: tabs for Research and Leisure, list of items per tab, add/edit/delete dialogs. Add dialog enforces the research-needs-linked-todo rule via the form (the data layer also enforces it).
8.2 Todos screen: tabs for Pending / In-progress / Done, add/edit/delete dialogs, recent-activity panel showing total minutes + last 5 sessions per todo.
8.3 Pending-research badges on todo cards and on Profile.

### §9 Share Target + bookmarklet

9.1 Update `public/manifest.webmanifest` with:
```json
"share_target": {
  "action": "/share",
  "method": "GET",
  "params": { "title": "title", "text": "text", "url": "url" }
}
```
9.2 `app/share/page.tsx` — reads query params, prefills add-to-queue form, defaults tag to Leisure.
9.3 Settings → bookmarklet section: shows the bookmarklet code (using `window.location.origin` as the host), a "Copy" button, and a draggable anchor (`<a href="javascript:…">Add to Pickle Juice</a>`) the user can drag to the bookmarks bar.

### §10 Settings additions

10.1 Earn ratio slider (1.0–5.0, step 0.5).
10.2 Apply window slider (1–30 days).
10.3 Pomodoro focus + break length inputs.
10.4 Streak threshold input (1–60 minutes).
10.5 Themes grid (mirrors Profile).
10.6 "Reset Time Bank" destructive action with confirmation; writes a single ledger entry that zeroes the balance.

## Expected imports (the contract with W5)

You import only from these modules; you must NOT touch their internals:

```ts
// from lib/db/sessions.ts (extended)
import { sessionRepository } from "@/lib/db/sessions";
// from lib/db/bank.ts
import { bankRepository, LeisureGatedError } from "@/lib/db/bank";
// from lib/db/queue.ts
import { queueRepository } from "@/lib/db/queue";
// from lib/db/todos.ts
import { todoRepository } from "@/lib/db/todos";
// from lib/db/pending-research.ts
import { pendingResearchRepository } from "@/lib/db/pending-research";
// from lib/db/prefs.ts
import { prefsRepository } from "@/lib/db/prefs";
// from lib/domain/progression.ts
import { levelForXp, xpForLevel, evaluateStreak } from "@/lib/domain/progression";
// from lib/themes/themes.ts
import { THEMES, themeById } from "@/lib/themes/themes";
```

If a name you need isn't listed, ask W5 to expose it — don't reach into internals.

## What you must NOT do

- No persistence logic in components. Everything goes through the W5 repos.
- No XP / time-bank / streak math in components. Use W5's pure functions.
- No edits to `openspec/**` or `lib/**`.

## Reference reading

- `openspec/changes/add-gamification-and-queues/proposal.md`
- All 7 v2 spec files (esp. `core-tracking`, `time-bank`, `cosmetic-progression`)
- `docs/worktrees/W5-data.md` (the contract you're consuming)
- The existing `components/` tree (your starting point — most v1 screens get rewritten or extended)
- `app/page.tsx`, `app/layout.tsx`
