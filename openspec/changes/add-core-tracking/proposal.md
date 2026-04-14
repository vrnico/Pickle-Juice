## Why

Users want self-awareness about how much of their day is spent consuming versus creating, but no lightweight tool makes this ratio visible. Pickle Juice v1 gives them a two-tap manual timer and a daily ratio view — no account, no backend, works on phone and desktop as a PWA.

## What Changes

- Introduce the app as a Next.js PWA (installable on iOS/Android/desktop)
- Provide a manual start/stop timer with a required Consume or Create tag
- Persist completed sessions locally via IndexedDB (Dexie); survives reloads and offline
- Render a dashboard showing today's and this-week's consume-vs-create ratio plus session list
- Allow edit/delete of past sessions (correcting mistakes, adjusting durations)
- Allow CSV export of all sessions for user-owned backup
- Run fully client-side — no auth, no server, no analytics in v1

## Capabilities

### New Capabilities

- `core-tracking`: the full v1 feature set — timers, tagging, local persistence, dashboard, edit/delete, and CSV export. Scoped as one capability because every piece is coupled to the session record and its lifecycle.

### Modified Capabilities

None — greenfield project.

## Impact

- **New code**: entire `app/`, `components/`, `lib/` trees in this repo (currently empty)
- **New dependencies**: `next`, `react`, `dexie`, `tailwindcss`, `shadcn/ui`, a chart library (e.g. `recharts`), `zod` for input validation
- **Deploy target**: Vercel project linked to this repo (created during W2 work)
- **Browser storage**: IndexedDB database `picklejuice` (v1 schema: one `sessions` table)
- **No migrations, no APIs, no third-party services** in v1
