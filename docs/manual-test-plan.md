# Pickle Juice — Manual Test Plan

One row per scenario in `openspec/changes/add-core-tracking/specs/core-tracking/spec.md`.

Run this against a Vercel preview deploy before promoting to production. Fill in **Passed?** as `Y <YYYY-MM-DD>` when you've walked the scenario by hand, or `N <reason>` if it fails.

## How to use

1. Install the PWA on the device under test (phone + desktop should each be walked at least once).
2. Start each test from a **clean state**: open DevTools → Application → IndexedDB → delete the `picklejuice` database, then reload. Exceptions to clean-state setup are called out in the Steps column.
3. Timestamps in the spec use ISO-8601; the UI may display local time — judge against local equivalents.

## Device matrix

- **D1**: iOS Safari (PWA installed via Add to Home Screen)
- **D2**: Android Chrome (PWA installed via install prompt)
- **D3**: Desktop Chromium (Chrome/Edge/Brave, PWA installed)

Every scenario should pass on **at least one device**. Scenarios marked **(all devices)** must pass on every device in the matrix.

---

## Start a tracking session

| # | Scenario | Steps | Expected | Passed? |
|---|---|---|---|---|
| 1.1 | Starting a Consume session from idle | From clean state on Home, tap **Consume** Start | Home switches to active-session view; elapsed timer is visible and incrementing; category label shows "Consume" | |
| 1.2 | Starting a Create session from idle | From clean state on Home, tap **Create** Start | Home switches to active-session view; elapsed timer is incrementing; category label shows "Create" | |
| 1.3 | Attempting to start while a session is active | Start any session, then tap the other category's Start button | A prompt appears asking whether to stop the current session first; no second session starts | |

## Stop the active session

| # | Scenario | Steps | Expected | Passed? |
|---|---|---|---|---|
| 2.1 | Stopping a session with non-zero duration | Start a session, wait ≥2s, tap **Stop** | Home returns to idle; the session appears in History with correct category, start, end, and duration | |
| 2.2 | Stopping a session under one second | Start a session and tap Stop within ~500ms | Home returns to idle; **no** session is recorded in History; no error shown | |

## Persist sessions locally

| # | Scenario | Steps | Expected | Passed? |
|---|---|---|---|---|
| 3.1 | Session survives a page reload | Record one session, then hard-reload the page (Ctrl+Shift+R) | The session is still in History with identical category, timestamps, and duration | |
| 3.2 | Session is recorded while offline **(all devices)** | DevTools → Network → Offline. Record a session. | Session saves successfully; Network panel shows zero outbound requests for storage; session is visible immediately in History | |

## Recover an interrupted session

| # | Scenario | Steps | Expected | Passed? |
|---|---|---|---|---|
| 4.1 | App reopened with an active session | Start a session, close the browser tab/app without stopping, wait ≥1 min, reopen the app | Recovery prompt appears with two options: **Keep session running** and **End now** | |
| 4.2 | Keep running | From 4.1, choose **Keep session running** | Timer resumes using the original start timestamp; elapsed time reflects the total gap | |
| 4.3 | End now | From 4.1 (repeat setup), choose **End now** | Session is saved with end = time of choice; Home returns to idle | |

## View the dashboard

| # | Scenario | Steps | Expected | Passed? |
|---|---|---|---|---|
| 5.1 | Dashboard with data | Record at least one Consume and one Create session today, open Dashboard | Ratio visualization renders; totals in minutes are shown for each category; percentage split matches the underlying data | |
| 5.2 | Dashboard with no data | From clean state, open Dashboard | Empty state with a "start your first session" CTA; no broken chart rendered | |

## Browse session history

| # | Scenario | Steps | Expected | Passed? |
|---|---|---|---|---|
| 6.1 | Viewing the session list | Record sessions across at least two calendar days (use edit to backdate one), open History | Sessions listed newest first, grouped under date headings; each row shows category, duration, and start time | |

## Edit a past session

| # | Scenario | Steps | Expected | Passed? |
|---|---|---|---|---|
| 7.1 | Correcting a mis-tagged session | Open a Consume session from History, change category to Create, save | History row updates; Dashboard recomputes to reflect the new category | |
| 7.2 | Editing produces an invalid duration | Edit any session to set end time earlier than start time, attempt save | Save rejected; inline validation error explains "end must be after start"; record remains unchanged | |

## Delete a past session

| # | Scenario | Steps | Expected | Passed? |
|---|---|---|---|---|
| 8.1 | Deleting a session | In History, delete a session and confirm | Session disappears from History; Dashboard recomputes without it | |

## Export sessions as CSV

| # | Scenario | Steps | Expected | Passed? |
|---|---|---|---|---|
| 9.1 | Exporting sessions | With ≥1 session stored, open Settings and tap **Export** | A file named `picklejuice-export-<yyyy-mm-dd>.csv` downloads; columns are exactly `id,category,start_iso,end_iso,duration_seconds,notes` in that order; every stored session appears as a row | |
| 9.2 | Exporting with zero sessions | From clean state, open Settings and tap **Export** | No file is generated; a message explains there is nothing to export | |

## Install as a PWA

| # | Scenario | Steps | Expected | Passed? |
|---|---|---|---|---|
| 10.1 | Installing on a supported browser **(all devices)** | Visit the deployed site in a PWA-capable browser | Install prompt / Add to Home Screen flow available; after install, app launches standalone with Pickle Juice icon and name | |
| 10.2 | Launching the installed PWA offline **(all devices)** | Visit the site once online, install, then turn off network and launch from the home screen | App loads from service worker cache; Home, Dashboard, History, Settings all render against local data without network | |

---

# v2 — add-gamification-and-queues

These rows cover every scenario in the seven v2 capability spec files. Run them on top of a populated v1 dataset where possible — many of them depend on the v1→v2 migration having already happened.

## Core Tracking (modified)

| # | Scenario | Steps | Expected | Passed? |
|---|---|---|---|---|
| C-1 | Leisure subtype on a freestyle consume session | Tap Consume → Freestyle → Leisure → Start; stop after ≥2s | History row's stored subtype is `leisure` (verify via DevTools → IndexedDB) | |
| C-2 | Research subtype derived from queue item | Add a Research-tagged queue item linked to a pending todo, tap Consume → pick that item → start; stop after ≥2s | Stored session has `subtype = "research"` and `linkedItemId` matching the queue item | |
| C-3 | Linking a create session to a todo | Add a pending todo, tap Create → pick that todo → start; stop after ≥2s | Stored session has `linkedItemId` matching the todo | |
| C-4 | Freestyle session has no linked item | Start a freestyle Create session, stop after ≥2s | Stored session has `linkedItemId = undefined` | |
| C-5 | Bank balance visible while idle | Open Home with no session running | Bank pill ("Bank: <N> min") visible near Consume button | |
| C-6 | Bank balance ticks down during leisure consume | Have ≥10 min in bank, start a Leisure consume session, watch the bank pill | Pill decreases at one minute per minute, in real time | |
| C-7 | Starting Leisure with credit available | Bank > 0, start Leisure consume | Session starts normally | |
| C-8 | Starting Leisure with empty bank | Drain bank to 0 (or use Settings → Reset Bank), tap Leisure Consume | Start is blocked; inline message shows minutes-to-create needed to unlock | |
| C-9 | Bank reaches zero mid-session | Start with 1 min in bank, run a leisure session past 1 min | Session auto-stops, saves, bank-empty message appears | |
| C-10 | Picking a queue item via the picker | Tap Consume, pick a saved item from the picker | Session starts with that item's subtype + linkedItemId | |
| C-11 | Skipping the picker → freestyle subtype prompt | Tap Consume → Freestyle | System prompts for Research vs Leisure subtype before starting | |
| C-12 | Starting Consume from idle opens the picker | Tap Consume from idle | Picker modal appears with queue items grouped by subtype + Freestyle option | |
| C-13 | Starting Create from idle opens the picker | Tap Create from idle | Picker modal appears with pending todos + Freestyle option | |
| C-14 | Attempting to start while a session is active (regression) | Start any session, then tap a Start button | "Stop current session first?" prompt; no second session starts | |

## Time Bank

| # | Scenario | Steps | Expected | Passed? |
|---|---|---|---|---|
| TB-1 | Bank balance is the sum of ledger entries | DevTools → IndexedDB → bankLedger; sum the `amount` fields | Sum equals the displayed bank balance | |
| TB-2 | Balance never lost on edit | Note bank balance, edit a past Create session's duration in History, save | Bank balance updates by the net change; ledger now contains compensating + new entries (no edit-in-place) | |
| TB-3 | Default earn ratio | With earnRatio = 2.0 default, save a 30-min Create session | Ledger gets a +60-min credit entry | |
| TB-4 | Custom earn ratio | Settings → set earn ratio to 1.5; save a 20-min Create session | Ledger gets a +30-min credit entry | |
| TB-5 | Debiting a completed leisure session | Save a 15-min Leisure consume session | Ledger gets a -15-min debit entry | |
| TB-6 | Live debit while session runs | Note balance, start a Leisure session, watch | Displayed balance decreases continuously while elapsed seconds tick | |
| TB-7 | Editing a leisure consume session's duration | Note balance, edit a 10-min leisure session down to 5 min | Ledger gets +10 (compensate) and -5 (new); net effect -5; displayed balance reflects | |
| TB-8 | Deleting a Create session | Note balance, delete a 20-min Create session that earned 40 min | Ledger gets a -40-min entry; balance decreases by 40 | |
| TB-9 | First open after install | Fresh browser profile, install + open app | bankLedger contains a single +60 "Starter grant" entry | |
| TB-10 | Existing v1 user upgrading | With pre-existing v1 sessions in IndexedDB, open v2 for the first time | One +60 starter grant appears; reopening does not add more | |
| TB-11 | Changing the earn ratio | Settings → change earn ratio to 3.0; save a Create session; check earlier sessions | Subsequent sessions credit at 3:1; previous sessions are not retroactively re-credited | |

## Consume Queue

| # | Scenario | Steps | Expected | Passed? |
|---|---|---|---|---|
| CQ-1 | Adding a queue item from the Queue screen | Queue → Add → URL + title + Leisure tag → Save | Item appears at top of Leisure section | |
| CQ-2 | Adding a Research item linked to a todo | Queue → Add → Research tag → pick a pending todo → Save | Item stored with `tag = "research"` and `linkedTodoId` set | |
| CQ-3 | Research item without a linked todo | Queue → Add → Research tag → leave linked todo empty → Save | Save rejected; form requires linked todo or tag change to Leisure | |
| CQ-4 | Empty queue | Open Queue with zero items | Empty state explains adding items pre-tags consume sessions | |
| CQ-5 | Editing a queue item | Open a Leisure item, change tag to Research + link a todo, Save | Item moves to Research group | |
| CQ-6 | Deleting a queue item | Delete an item that has a linked historical session, confirm | Item removed; history row still shows linkedItemId pointing to the (now missing) item | |
| CQ-7 | Auto-mark on session end | Start a consume session linked to a queue item, stop after ≥2s | Item's status flips to `consumed`; collapses to "Recently consumed" list | |
| CQ-8 | Manual mark consumed | Tap "Mark consumed" on a queue item | Status flips to `consumed`; no session created | |

## Create Todos

| # | Scenario | Steps | Expected | Passed? |
|---|---|---|---|---|
| CT-1 | Adding a todo | Todos → Add → "Finish vertex shader demo" → Save | Todo appears at top of Pending list | |
| CT-2 | Picking a todo before starting | Tap Create → pick a pending todo → start | Session has `linkedItemId` matching todo; todo's status flips to `in-progress` | |
| CT-3 | Skipping the todo picker | Tap Create → Freestyle | Session starts with `linkedItemId = undefined` | |
| CT-4 | Marking done after a session | Stop a Create session linked to a todo → tap "Mark done" | Todo status `done`; `completedAt` recorded | |
| CT-5 | Leaving the todo in-progress | Stop session → dismiss the prompt | Todo remains `in-progress` | |
| CT-6 | Deleting a todo with linked sessions | Delete a todo with 3 linked sessions, confirm | Todo removed; sessions remain in history with orphaned linkedItemId | |
| CT-7 | Active todo view | Open an in-progress todo with linked sessions | Shows total minutes, count, and last 5 session entries | |

## Research Application

| # | Scenario | Steps | Expected | Passed? |
|---|---|---|---|---|
| RA-1 | Research session ends free | With apply window 7d, complete a 20-min Research session linked to todo X | pendingResearch table gets a row `{ todoId: X, minutes: 20, deadline: end + 7d }`; bank NOT debited | |
| RA-2 | Single create session covers research | After RA-1, save any-duration Create session linked to todo X | Pending entry marked `applied`; notification confirms research applied | |
| RA-3 | Apply window expires | Manually expire (set system clock or seed pending entry with past deadline) without any Create against todo X | -20 min "Unapplied research" debit posts to bank; user sees notification | |
| RA-4 | Apply window expires while bank is empty | RA-3 setup but with bank already at 0 | Debit still posts; balance goes negative; Leisure remains gated until bank goes positive | |
| RA-5 | Pending research visible on a todo | Open todo X with a pending research entry | "20 min research pending — apply by <date>" badge visible on the todo | |
| RA-6 | Cancel pending entry by deleting its session | Delete the originating Research session before its window expires | Pending entry removed; bank unaffected | |

## Pomodoro Mode

| # | Scenario | Steps | Expected | Passed? |
|---|---|---|---|---|
| PM-1 | Starting a Pomodoro Create session | Pomodoro toggle ON → Create → start | Active-session view shows 25-min countdown prominently | |
| PM-2 | Switching off Pomodoro mode | Toggle OFF → start any session | Session is open-ended elapsed timer (v1 behavior) | |
| PM-3 | Focus block elapses | Run a Pomodoro until 25:00 | Session saves automatically; chime plays (if permitted); modal shows break/stop | |
| PM-4 | Choosing the break | After PM-3 → tap "Take a 5-minute break" | 5-min break countdown displayed; bank unaffected during break | |
| PM-5 | Choosing to stop | After PM-3 → tap "Stop session" | Session ends; home returns to idle | |
| PM-6 | Custom focus length | Settings → focus 50 / break 10 → start a Pomodoro | Countdown is 50:00; subsequent break is 10:00 | |
| PM-7 | Bank empties mid-Pomodoro | Bank = 12 min, start a 25-min Leisure Pomodoro | Stops at minute 12; saves 12-min session; break skipped; bank-empty message shown | |

## Cosmetic Progression

| # | Scenario | Steps | Expected | Passed? |
|---|---|---|---|---|
| CP-1 | Default XP weights — Create | Save a 10-min Create session | XP increases by 30 (Create weight 3) | |
| CP-2 | Default XP for Research | Save a 10-min Research consume session | XP increases by 20 (Research weight 2) | |
| CP-3 | Default XP for Leisure | Save a 10-min Leisure consume session | XP increases by 10 (Leisure weight 1) | |
| CP-4 | XP cannot be spent for time | Audit Profile and Settings | No button, slider, action, or hidden affordance converts XP/level/streak/badge into bank credit | |
| CP-5 | Reaching level 2 | Earn enough XP to cross the level 2 threshold | One-time celebration overlay; level 2 cosmetic asset becomes selectable in Themes | |
| CP-6 | Selecting an unlocked theme | Settings → Themes → pick an unlocked theme | Palette swaps immediately; persists across reload | |
| CP-7 | Extending a streak | Yesterday: ≥10 min Create logged; today: ≥10 min Create logged | Today's streak count = yesterday's + 1 | |
| CP-8 | Breaking a streak | Skip a full local-time day with zero Create | Current streak resets to 0; longest preserved | |
| CP-9 | Viewing the Profile | Open Profile tab | Shows XP, level + progress bar, current streak, longest, themes grid (unlocked vs locked) | |
| CP-10 | Reading the disclosure | Profile → expand "How this works" | Prose explicitly states cosmetic progression never grants leisure consume time | |

## Share Target & Bookmarklet

| # | Scenario | Steps | Expected | Passed? |
|---|---|---|---|---|
| SB-1 | Sharing a YouTube link from Android Chrome | On Android with PWA installed: any app → Share → Pickle Juice | App opens at /share with URL pre-filled in Add-to-queue form | |
| SB-2 | Opening /share with a URL | Visit `/share?title=Foo&url=https://example.com` directly | Form pre-filled (title=Foo, url=https://example.com), tag=Leisure, Save creates queue item | |
| SB-3 | Opening /share with no parameters | Visit `/share` with no query string | Empty Add-to-queue form ready for manual entry | |
| SB-4 | Using the bookmarklet | Drag the bookmarklet from Settings to bookmarks bar; navigate to a YouTube video; click bookmarklet | New tab opens at /share with the video's URL and title pre-filled | |
| SB-5 | Bookmarklet hostname configuration | Inspect the bookmarklet code in Settings | Hardcodes the current Pickle Juice deployment's origin | |

---

## Sign-off (v1)

- Preview URL walked: ______________________________
- Build commit SHA: ______________________________
- Walker: ______________________________
- Date: ______________________________
- Device(s) covered: ______________________________

When every v1 row has a `Y` pass, W1 can be merged into main and `openspec archive add-core-tracking` is safe to run after W2+W3 merge.

## Sign-off (v2)

- Preview URL walked: ______________________________
- Build commit SHA: ______________________________
- Walker: ______________________________
- Date: ______________________________
- Device(s) covered: ______________________________

When every v2 row has a `Y` pass, `openspec archive add-gamification-and-queues` is safe to run.
