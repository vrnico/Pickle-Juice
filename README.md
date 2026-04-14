# Pickle Juice 🥒

**Track the time you spend consuming vs. creating.**

Pickle Juice is a Progressive Web App that makes one question easy to answer: *how much of today did I spend taking things in versus making things?* You tap **Consume** or **Create**, start the timer, stop when you're done, and the dashboard shows your ratio for today and the last seven days. Works on your phone, works on your laptop, works offline, stores everything on-device.

This repo is scaffolded with [OpenSpec](https://github.com/Fission-AI/OpenSpec) and is designed to be built out by **three Claude Code sessions running in parallel git worktrees**. Read [`ROADMAP.md`](ROADMAP.md) for the full parallel-build strategy.

---

## What's in the repo right now

This is a spec-first repo. At the moment it contains the **plan**, not the built app:

```
Pickle-Juice/
├── openspec/
│   ├── project.md                              ← product vision + stack
│   └── changes/add-core-tracking/
│       ├── proposal.md                         ← why / what / impact
│       ├── specs/core-tracking/spec.md         ← 11 requirements, 20 scenarios (Gherkin-style)
│       └── tasks.md                            ← numbered implementation checklist
├── docs/worktrees/
│   ├── W1-specs.md                             ← brief for Spec Claude
│   ├── W2-pwa-ui.md                            ← brief for UI Claude
│   └── W3-data-engine.md                       ← brief for Data Claude
├── ROADMAP.md                                  ← parallel worktree strategy
└── README.md                                   ← you are here
```

The Next.js app itself gets created during **task §1.1** by the W2 worktree.

---

## Prerequisites

Install these once on your machine:

| Tool | Why | Install |
|---|---|---|
| **Node.js 20+** | Next.js 16 runtime | [nodejs.org](https://nodejs.org) or `nvm install 20` |
| **pnpm** (or npm) | package manager | `npm i -g pnpm` |
| **Git 2.25+** | worktrees need modern git | `git --version` |
| **Claude Code CLI** | drives the 3 parallel sessions | [claude.com/claude-code](https://claude.com/claude-code) |
| **OpenSpec CLI** | spec validation + change mgmt | `npm i -g openspec` |
| **Vercel CLI** (optional) | preview deploys | `npm i -g vercel` |

Verify:

```bash
node -v      # v20.x or higher
pnpm -v
git --version
claude --version
openspec --version
```

---

## Quick start — read-only (just look at the specs)

```bash
git clone https://github.com/vrnico/Pickle-Juice.git
cd Pickle-Juice

# Validate the change proposal
openspec validate add-core-tracking --strict

# Dump the spec as one readable markdown doc
openspec show add-core-tracking --type change

# List every requirement + scenario
openspec list --specs
```

You can read `openspec/changes/add-core-tracking/specs/core-tracking/spec.md` top to bottom to understand what the app does before a single line of code exists. That's the point of spec-first.

---

## Building it — parallel-Claude workflow

This is how the project is designed to be built. You'll end up with **three terminal windows**, each running its own Claude Code session against its own branch.

### 1. Fork + clone

```bash
gh repo fork vrnico/Pickle-Juice --clone
cd Pickle-Juice
```

(Or clone directly if you're not submitting a PR back.)

### 2. Create the three worktrees

From the root of your clone:

```bash
git branch specs/core-tracking
git branch feat/pwa-ui
git branch feat/data-engine

git worktree add ../Pickle-Juice-W1-specs       specs/core-tracking
git worktree add ../Pickle-Juice-W2-pwa-ui      feat/pwa-ui
git worktree add ../Pickle-Juice-W3-data-engine feat/data-engine
```

You now have three sibling directories, each on its own branch, sharing the same git history.

### 3. Open three terminals, one per worktree

```bash
# Terminal 1 — specs
cd ../Pickle-Juice-W1-specs
claude "Read docs/worktrees/W1-specs.md and work that brief."

# Terminal 2 — PWA UI
cd ../Pickle-Juice-W2-pwa-ui
claude "Read docs/worktrees/W2-pwa-ui.md and work that brief."

# Terminal 3 — data engine
cd ../Pickle-Juice-W3-data-engine
claude "Read docs/worktrees/W3-data-engine.md and work that brief."
```

Each brief tells that Claude exactly which task section it owns, what interfaces it must respect, and when to stop.

### 4. Merge order

1. **W1 first** — once `openspec validate --strict` passes and the manual test plan is written, merge `specs/core-tracking` → `main`.
2. **W3 next** — merge `feat/data-engine` → `main` so the UI has a real `lib/db/sessions.ts` to import.
3. **W2 last** — merge `feat/pwa-ui` → `main`, then promote the Vercel deploy.
4. **Archive** — run `openspec archive add-core-tracking` to move the change into `openspec/specs/core-tracking/` as the new source of truth.

Details and coordination rules in [`ROADMAP.md`](ROADMAP.md).

---

## Building it — solo (no parallel worktrees)

If you want to build it yourself start-to-finish without the Claude-per-worktree setup, just follow [`openspec/changes/add-core-tracking/tasks.md`](openspec/changes/add-core-tracking/tasks.md) top to bottom. The task sections are ordered so a single person can work through them linearly:

1. §1 Scaffolding → `npx create-next-app@latest .` inside the repo root, then install shadcn/ui and wire up Tailwind.
2. §2 Data layer → Dexie schema, repository, timer state machine, aggregations, CSV export.
3. §3 UI screens → Home, Dashboard, History, Settings.
4. §4 PWA shell → manifest, icons, service worker.
5. §5 Specs & verification → walk every scenario by hand.
6. §6 Ship → promote to Vercel production, then `openspec archive`.

Once §1 is done, the usual Next.js dev loop works:

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build
pnpm start
pnpm test         # Vitest, once §2.8 is done
```

---

## Deploy

```bash
vercel link       # one-time, link this directory to a Vercel project
vercel            # preview deploy
vercel --prod     # promote to production
```

No env vars are required in v1 — the app is fully client-side.

---

## Key decisions (for the class write-up)

- **PWA over native** — installable on phone + desktop, one codebase, no app stores.
- **IndexedDB over cloud** — zero-backend v1, privacy by default, works offline. Sync is a v2 concern.
- **Manual timers only** — a PWA is sandboxed from other tabs and apps; passive cross-app detection would require a browser extension, which is out of scope for v1.
- **Gherkin-style prose, no Cucumber runner** — scenarios are human-readable acceptance criteria. Each one becomes a manual test plan row in `docs/manual-test-plan.md` (written by W1).
- **OpenSpec** — every behavior the app ships is grounded in a requirement with at least one scenario. The spec is the contract between the three parallel worktrees.

---

## License

MIT (add a `LICENSE` file before publishing).
