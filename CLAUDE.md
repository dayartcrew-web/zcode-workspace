# CLAUDE.md

Quick operating guide for Claude working in this repo. Same project, same rules
as `AGENTS.md` — this is the concise version. Next.js 16 + React 19 + Tailwind 4
+ shadcn/ui admin-dashboard template. Run everything via `bun`, import app code
through the `@/*` alias (`./src/*`).

## 1. Task Completion Requirements

A task is not done until these gates pass from the repo root:

- `bun run lint` — `eslint .`, zero errors.
- `bunx tsc --noEmit` — typecheck. **Required:** `next.config.ts` sets
  `typescript.ignoreBuildErrors: true`, so the build will NOT catch type errors.
- `bun run build` — `next build` must succeed.
- No regressions. No test runner is configured yet — verify changes by clean
  gates plus a manual smoke of the touched routes, and add tests when adding
  features.
- Schema edits: run `bun run db:generate` (and `db:push`/`db:migrate`) before
  finishing.
- Never mark complete with an unverified gate.

## 2. Core Priorities

Performance, then reliability, then predictability (higher wins on conflict).
Keep the bundle small; make every optional integration fail gracefully to a
deterministic fallback (see the simulation sidecar pattern); keep logic pure and
data flow traceable through the Zustand store.

## 3. Maintainability

- Keep business logic in `src/lib/`; components stay presentational and thin.
- No duplication — extract shared logic into `src/lib` (util, typed helper, or
  store action) and reuse it.
- Add state as a new slice in `src/lib/features/<name>/`; don't overload
  existing slices.
- Compose the shadcn primitives in `src/components/ui/`; extend the shared
  component rather than forking one-offs.
- `strict` is on — prefer precise types over `any` for new code.

## 4. Project Layout

- `src/app/` — App Router: layout, page, global styles, `api/` route handlers.
- `src/components/ui/` — shadcn/ui primitives (design system).
- `src/components/zcode/` — workspace feature UI (sidebars, settings, panels).
- `src/hooks/` — shared hooks (use-mobile, use-toast).
- `src/lib/` — core logic: Zustand `store.ts` + `features/*` slices, `db.ts`
  Prisma singleton, types, utils, `useSimulation.ts`.
- `prisma/` — SQLite schema (Task, Message, FileChange, ChecklistItem).
- `public/` — static assets (logo.svg, robots.txt).
- `mini-services/` — optional socket.io sim sidecar on :4001 (seed-data fallback).
- `examples/` — demos, excluded from lint/build.

Root config: `next.config.ts` (standalone), `tsconfig.json`, `eslint.config.mjs`,
`tailwind.config.ts`, `postcss.config.mjs`, `components.json`.

## 5. Reference Docs

`README.md` (root), `.docs/` (architecture notes, added separately),
`mini-services/README.md` (sidecar contract), `prisma/schema.prisma` (models).
