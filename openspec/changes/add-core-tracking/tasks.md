## 1. Project scaffolding (shared foundation)

- [ ] 1.1 Initialize Next.js 16 App Router project with TypeScript and Tailwind in repo root
- [ ] 1.2 Add shadcn/ui and install base components (Button, Card, Dialog, Toast)
- [ ] 1.3 Configure ESLint, Prettier, and a pre-commit hook
- [ ] 1.4 Link project to Vercel and verify a preview deploy of the empty Next.js shell succeeds

## 2. Data layer (W3 — data-engine worktree)

- [ ] 2.1 Install Dexie and define the `picklejuice` database with a `sessions` table (`id`, `category`, `startIso`, `endIso`, `durationSeconds`, `notes`, `createdAt`, `updatedAt`)
- [ ] 2.2 Implement session repository in `lib/db/sessions.ts` (create, update, delete, listByRange, listAll)
- [ ] 2.3 Implement active-session state machine (`idle` → `running` → `idle`) persisted so reloads can recover
- [ ] 2.4 Implement interrupted-session recovery logic per spec (Keep running / End now)
- [ ] 2.5 Implement "stop under 1s is discarded" rule
- [ ] 2.6 Implement CSV export helper in `lib/export/csv.ts` returning a Blob with the spec's columns
- [ ] 2.7 Implement aggregation helpers (`sumByCategory(range)`, `ratioForDay(date)`, `ratioForLast7Days()`)
- [ ] 2.8 Unit tests for repository, state machine, aggregations, and CSV export

## 3. UI layer (W2 — pwa-ui worktree)

- [ ] 3.1 Home screen with idle state (Consume Start / Create Start buttons)
- [ ] 3.2 Home screen active-session view with running elapsed time and Stop button
- [ ] 3.3 Confirmation prompt when Start is tapped while a session is active
- [ ] 3.4 Dashboard view with today's ratio bar, 7-day ratio bar, and totals in minutes
- [ ] 3.5 Dashboard empty state with "start your first session" call to action
- [ ] 3.6 History view grouped by day, reverse-chronological, showing category/duration/start
- [ ] 3.7 Edit-session dialog with category + start/end inputs and validation ("end must be after start")
- [ ] 3.8 Delete-session flow with confirmation
- [ ] 3.9 Settings screen with CSV Export button and empty-state error for zero sessions
- [ ] 3.10 Bottom nav / tab switcher (Home / Dashboard / History / Settings)
- [ ] 3.11 Install prompt hint on supported browsers

## 4. PWA shell (W2 — pwa-ui worktree)

- [ ] 4.1 Author `public/manifest.webmanifest` with name, short_name, icons (192/512), start_url, display=standalone, theme/background colors
- [ ] 4.2 Generate icon set (at least 192px and 512px maskable)
- [ ] 4.3 Register service worker for offline shell caching (Next.js App Router compatible approach)
- [ ] 4.4 Verify Lighthouse PWA installability passes on a Vercel preview deploy
- [ ] 4.5 Verify cold-start from home screen works fully offline

## 5. Specs & verification (W1 — specs worktree)

- [x] 5.1 Run `openspec validate add-core-tracking` and resolve any validation errors
- [x] 5.2 Map every scenario in `specs/core-tracking/spec.md` to at least one manual test in `docs/manual-test-plan.md`
- [ ] 5.3 Walk every scenario by hand on a Vercel preview deploy before archiving the change

## 6. Ship

- [ ] 6.1 Promote the Vercel preview to production once scenario walkthrough is green
- [ ] 6.2 `openspec archive add-core-tracking` to move the change into `openspec/specs/`
