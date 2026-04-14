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

## Sign-off

- Preview URL walked: ______________________________
- Build commit SHA: ______________________________
- Walker: ______________________________
- Date: ______________________________
- Device(s) covered: ______________________________

When every row has a `Y` pass, W1 can be merged into main and `openspec archive add-core-tracking` is safe to run after W2+W3 merge.
