# W2 — PWA UI Worktree

**Branch:** `feat/pwa-ui`
**You own task sections §1, §3, §4, §6** in `openspec/changes/add-core-tracking/tasks.md`.

## Your job

Build the entire interface: project scaffolding, the four screens (Home, Dashboard, History, Settings), the PWA shell (manifest + service worker), and the Vercel deploy. You consume the data layer W3 is building — do not reimplement storage or aggregation yourself.

## Checklist

### §1 — Project scaffolding (do this first, commit, notify user before other worktrees start building)

1.1 `npx create-next-app@latest .` with: App Router, TypeScript, Tailwind, ESLint, `src/` dir No.
1.2 Install shadcn/ui: `npx shadcn@latest init`, then add `button card dialog toast tabs input label`.
1.3 Configure Prettier and a pre-commit hook (`husky` + `lint-staged` or similar).
1.4 Link to Vercel (`vercel link`), push a branch, confirm the preview deploy renders the default Next.js page.

### §3 — UI screens

Build against the `SessionRepository` interface at `lib/db/sessions.ts`. **If W3 hasn't merged yet, create a typed mock** at `lib/db/sessions.mock.ts` that matches the expected interface and swap to the real one on rebase.

Screens to build (see `openspec/changes/add-core-tracking/specs/core-tracking/spec.md` for exact behavior):
- **Home** — idle state with Consume/Create Start buttons; active state with running timer + Stop; confirmation prompt when Start is tapped mid-session.
- **Dashboard** — today's ratio bar, 7-day ratio bar, totals in minutes, empty state CTA.
- **History** — grouped-by-day list, edit dialog with start/end/category, delete confirmation.
- **Settings** — CSV export button, empty-state message.
- **Bottom nav** — Home / Dashboard / History / Settings.

### §4 — PWA shell

4.1 `public/manifest.webmanifest` with name="Pickle Juice", short_name="Pickle Juice", icons 192/512 (maskable), start_url="/", display="standalone", theme and background colors matching the UI.
4.2 Generate icons (use a single SVG source → 192 and 512 PNGs).
4.3 Register a service worker for offline shell caching — use [`@serwist/next`](https://serwist.pages.dev/docs/next) or Next.js 16's built-in support.
4.4 Vercel preview must pass Lighthouse PWA installability.
4.5 Preview must cold-boot offline after one online visit.

### §6 — Ship

6.1 Once the manual test plan (owned by W1) is fully green against your preview, promote to production with `vercel --prod`.
6.2 Run `openspec archive add-core-tracking` on main after merge.

## Contract with W3

You import from `lib/db/sessions.ts`. Expected surface (confirm exact names in W3's merged code):
```ts
type Category = "consume" | "create";
type Session = { id: string; category: Category; startIso: string; endIso: string; durationSeconds: number; notes?: string; createdAt: string; updatedAt: string };
type DraftSession = { category: Category; startIso: string; endIso: string; notes?: string };
type ActiveSession = { category: Category; startIso: string } | null;

interface SessionRepository {
  createFromDraft(draft: DraftSession): Promise<Session>;
  update(id: string, patch: Partial<DraftSession>): Promise<Session>;
  delete(id: string): Promise<void>;
  listAll(): Promise<Session[]>;
  listByRange(startIso: string, endIso: string): Promise<Session[]>;
  getActive(): Promise<ActiveSession>;
  setActive(active: ActiveSession): Promise<void>;
  sumByCategory(startIso: string, endIso: string): Promise<Record<Category, number>>;
  exportCsvBlob(): Promise<Blob>;
}
```
If W3 ships a different shape, adapt — don't fork. Flag mismatches to the user.

## What you must NOT do

- Do not edit `openspec/**`. Specs are owned by W1.
- Do not write Dexie code, aggregation, or CSV serialization — that's W3.
- Do not add backend/API routes. v1 is client-only.

## Reference reading before you start

- `openspec/project.md`
- `openspec/changes/add-core-tracking/proposal.md`
- `openspec/changes/add-core-tracking/specs/core-tracking/spec.md`
- `ROADMAP.md`
