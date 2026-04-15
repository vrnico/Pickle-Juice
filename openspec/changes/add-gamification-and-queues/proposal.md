## Why

v1 of Pickle Juice is a passive ledger — it tells you the consume-vs-create ratio after the fact, but it doesn't change behavior in the moment. The class feedback was that it's too binary (consume = bad, create = good), it gives the user nothing to do between sessions, and it has no incentive structure. v2 turns Pickle Juice into a self-imposed behavior loop: you earn leisure time by creating, you keep a queue of intentional things to consume so you're not doomscrolling, you keep todos so creating has a focus, and optional Pomodoro mode adds structure for people who want it. Cosmetic XP and streaks add a satisfying progression layer, but — by deliberate design — they never grant additional consume time. The only thing that unlocks consume is creating.

## What Changes

- Subdivide consume into **Research** and **Leisure**. Research is free as long as it's linked to an active Create todo. Leisure is gated by a Time Bank.
- **Time Bank**: every minute of Create earns 2 minutes of Leisure consume credit (configurable). Leisure consume sessions debit the bank in real time. When the bank is empty, the Leisure consume button is disabled with a "create more" nudge.
- **Apply-or-debit rule**: Research minutes are tentatively free, but they're attached to the Create todo they served. If the user logs zero Create minutes against that todo within 7 days (configurable), the research minutes get retroactively debited from the bank with a notification.
- **Consume Queue**: saved links (URL, title, optional description, tag: research|leisure, optional linked Create todo for research items). Picking a queue item at session start auto-tags the session.
- **Create Todo List**: lightweight todos (title, description, status: pending|in-progress|done). Picking a todo at session start attaches it to the session; stopping prompts to mark done.
- **Optional pick at session start**: queue/todo selection is optional — freestyle sessions still work.
- **Pomodoro mode** (opt-in): a "Start as Pomodoro (25/5)" toggle. Pomodoro sessions auto-end at 25 min, prompt for 5-min break or stop, and credit/debit the bank like normal sessions.
- **Cosmetic progression** (purely visual, never grants time): XP per minute (Create > Research > Leisure), daily streak based on Create minutes, levels that unlock cosmetic themes/badges/icon variants.
- **Web Share Target**: installed PWA registers as a share target so users can share a URL from any app on Android/iOS into the Consume queue, pre-filled.
- **Bookmarklet**: a Settings-page-provided bookmarklet that opens Pickle Juice on the current tab's URL, ready to add to the queue.
- **BREAKING**: Existing sessions in IndexedDB lack `subtype` and `linkedItemId` fields. Migration backfills `subtype = "leisure"` for legacy consume sessions and leaves `linkedItemId` undefined.
- Onboarding gives the user a 60-minute starter Time Bank balance so existing users (and brand-new users) aren't immediately gated.

## Capabilities

### New Capabilities

- `time-bank`: ledger of Leisure consume credit — earning rules, debiting rules, gating logic that disables Leisure start when the balance is zero, and a starter grant
- `consume-queue`: CRUD for saved consume links, tagging as research|leisure, optional linked-todo for research items
- `create-todos`: CRUD for Create todos, status flow, pick-on-start integration
- `research-application`: tracks pending research minutes per todo and applies the retroactive-debit rule when the apply window expires
- `pomodoro-mode`: opt-in 25/5 cycle attached to either category
- `cosmetic-progression`: XP + streak + level + theme/badge unlocks; never grants consume credit
- `share-and-bookmarklet`: Web Share Target manifest entry, share-target landing route, and bookmarklet generator

### Modified Capabilities

- `core-tracking`: sessions gain a `subtype` field (`research` | `leisure` for consume; ignored for create) and an optional `linkedItemId` field (queue item id or todo id). Picking a queue/todo at start is optional. Idle Home screen surfaces the Time Bank balance and the Pomodoro toggle. Leisure consume start is gated by the Time Bank.

## Impact

- **New tables (Dexie v2 migration)**: `queueItems`, `todos`, `bankLedger`, `pendingResearch`, `progression` (single-row XP/streak/level), `themes` (a small static set in code, only the `selected` choice persists).
- **Schema migration**: `sessions` table v1 → v2 adds `subtype` and `linkedItemId`. Backfill `subtype = "leisure"` for existing consume sessions.
- **New routes / screens**: queue tab, todos tab, settings additions (earn ratio, apply window, Pomodoro lengths, bank reset, themes, bookmarklet), profile/progression view.
- **PWA manifest changes**: add `share_target` entry pointing to `/share` that ingests `title`, `text`, `url`.
- **No backend changes**: still 100% client-side. No accounts, no sync.
- **Fully replaces v1's binary consume model**, but tests and existing UI for create-side stay backward-compatible.
