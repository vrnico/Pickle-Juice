# Pickle Juice

## Product

Pickle Juice tracks time the user spends **consuming** (reading, watching, scrolling) versus **creating** (writing, coding, making). The goal is self-awareness: show a daily and weekly ratio so the user can see the balance of their attention.

v1 is intentionally small: manual start/stop timers tagged Consume or Create, stored locally in the browser, visualized on a simple dashboard.

## Stack

- **Next.js 16** (App Router) deployed to **Vercel**
- **PWA**: installable on phone and desktop via web app manifest + service worker
- **Dexie** (IndexedDB wrapper) for local persistence — no backend in v1
- **TypeScript** throughout
- **shadcn/ui** + Tailwind for interface
- **Recharts** (or similar) for the ratio dashboard

## Spec conventions

This project uses OpenSpec with **Gherkin-style scenarios**. Each requirement's scenarios use `WHEN`/`THEN` (and `AND` for continuation). Prose only — no Cucumber runner. Scenarios should read as plain-English acceptance criteria a human can execute by hand.

## Out of scope for v1

- Passive detection of what the user is doing in other tabs/apps (browser sandbox prevents this from a PWA alone)
- Cloud sync / accounts / auth
- Browser extension companion (future phase)
- Team/social features

## Repo layout

```
PickleJuice/
├── openspec/           # specs, changes, project.md
├── app/                # Next.js App Router
├── components/         # UI components
├── lib/                # domain logic, Dexie schema
├── public/             # PWA manifest, icons
├── ROADMAP.md          # parallel-execution roadmap
└── docs/worktrees/     # per-worktree briefs for parallel Claudes
```
