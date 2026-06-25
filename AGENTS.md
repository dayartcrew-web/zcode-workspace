# AGENTS.md

> **⚠️ Teardown notice:** The simulation sidecar, mock data, and demo UI were
> removed in the teardown (see [`TEARDOWN.md`](./TEARDOWN.md)). References to
> `dev:sim`, `mini-services/`, the simulation sidecar, and demo components
> below are historical. The verification gates (lint/typecheck/test/build) and
> the preserved `src/lib/{contracts,errors,config,domain}` boundary remain
> accurate and should be followed.

Guidance for any coding agent (or human contributor) working in this repository.
This is a Next.js 16 + React 19 + Tailwind 4 + shadcn/ui admin-dashboard
template styled as an AI development workspace. Read this before making changes.

All commands below run from the repository root and use `bun` as the runtime.
Import everything app-internal through the `@/*` path alias, which maps to
`./src/*` (see `tsconfig.json`).

## 1. Task Completion Requirements

Before claiming a task done, run every applicable gate and confirm it is clean.
Do not hand off with a failing gate. If a gate is blocked by a pre-existing
issue unrelated to your change, call it out explicitly rather than hiding it.

- **Lint clean:** `bun run lint` (runs `eslint .` via the ESLint 9 flat config
  in `eslint.config.mjs`). Zero errors. Note the config ignores
  `.masday/**`, `mini-services/**`, `examples/**`, `skills`, and `node_modules`.
- **Typecheck clean:** `bunx tsc --noEmit`. This is **required** because
  `next.config.ts` sets `typescript.ignoreBuildErrors: true`, so `next build`
  will NOT catch type errors. Do not rely on the build for type safety.
- **Build passes:** `bun run build` (`next build`, then copies static assets
  into `.next/standalone`). A green build is mandatory for anything touching
  routes, the app shell, or build config.
- **No regressions:** existing pages and flows must still work. There is **no
  unit/integration test runner configured** in this project today (no
  `test` script, no vitest/playwright dependency). Until tests are added,
  regression confidence comes from: a clean typecheck + lint + build, plus a
  manual smoke of the routes you touched (load the page, exercise the changed
  interaction). When you add a feature, add the first test and wire a runner if
  none exists — do not leave the suite empty by choice.
- **Prisma changes:** if you edit `prisma/schema.prisma`, run
  `bun run db:generate` (and `bun run db:push` or `bun run db:migrate` as
  appropriate) and confirm the client regenerates before finishing.
- **State that you did not run.** Never mark a task complete with unverified
  gates because of an assumed outcome.

## 2. Core Priorities

Rank trade-offs in this order; when goals conflict, the higher one wins.

1. **Performance** — keep the client bundle small and the UI responsive. Prefer
   code-splitting and lazy boundaries for heavy feature panels, memoize
   expensive renders, and avoid pulling large libs into hot paths.
2. **Reliability** — failures degrade gracefully. The simulation sidecar is the
   reference pattern: if the websocket can't connect, the app keeps working on
   seed data. Follow the same "optional dependency, deterministic fallback"
   shape for new integrations.
3. **Predictability** — behavior should be obvious and reproducible. Pure
   functions in `src/lib`, explicit data flow through the Zustand store, and no
   hidden side effects in render paths. A reader should be able to trace any UI
   state back to its slice and its origin without guessing.

## 3. Maintainability

Keep the codebase easy to change and hard to break.

- **Respect the `src/lib` boundary.** All non-trivial logic, types, data access,
  and state live under `src/lib/`. Components in `src/components/` should be
  presentational and thin; push business logic into `src/lib` modules rather
  than duplicating it inside components.
- **No duplication.** If two call sites need the same transformation, parsing,
  or domain rule, extract it once into `src/lib` (a util, a typed helper, or a
  Zustand slice action) and reuse it. Do not copy-paste logic.
- **Use the slice pattern for state.** App state is a single Zustand store
  (`src/lib/store.ts`) composed from feature slices in
  `src/lib/features/<name>/` (each has an `index.ts` and a `slice.ts`). Add new
  state domains as a new slice; do not bolt unrelated fields onto an existing
  slice.
- **One purpose per module.** Keep files focused; prefer adding a small,
  well-named module over expanding an existing one past its responsibility.
- **Touch the design system once.** Shared visuals are the shadcn/ui primitives
  in `src/components/ui/`. Compose them; extend the shared component rather than
  forking a one-off variant when behavior is reusable.
- **Keep types honest.** `strict` mode is on. Prefer precise types over `any`
  for new code even though several legacy lint rules are relaxed; new `any`s
  should be justified, not habitual.

## 4. Project Layout

```
src/
  app/           Next.js App Router: root layout, home page, global styles,
                 and api/ route handlers (/api, /api/chat, /api/tasks, /api/tasks/[id]).
  components/
    ui/          shadcn/ui primitives (button, card, dialog, table, chart, ...) —
                 the shared design-system building blocks.
    zcode/       workspace feature components (sidebars, central content, settings,
                 source-control, simulation provider) that compose the dashboard UI.
  hooks/         shared React hooks (use-mobile, use-toast).
  lib/           core logic boundary:
                   store.ts        — Zustand store composed from feature slices
                   features/<name>/ — one slice per state domain
                   db.ts           — Prisma client singleton
                   types.ts, utils.ts, format.ts — shared types/helpers
                   useSimulation.ts — websocket sidecar hook (graceful offline fallback)
prisma/          Prisma schema (SQLite): Task, Message, FileChange, ChecklistItem.
public/          static assets served as-is (logo.svg, robots.txt).
mini-services/   standalone socket.io simulation sidecar (sim-server.ts) streaming
                 live events on :4001; optional — app falls back to seed data.
examples/        reference demos (websocket); excluded from lint/build.
```

Root config: `next.config.ts` (standalone output), `tsconfig.json`,
`eslint.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, `components.json`.

## 5. Reference Docs

- `README.md` — project overview and quickstart (root).
- `.docs/` — deeper design and architecture notes (populated separately). When
  present, prefer it for "why" questions; this file covers "how to work here".
- `mini-services/README.md` — simulation sidecar contract: ports, event
  protocol, and the offline-fallback guarantee.
- `prisma/schema.prisma` — source of truth for data models.
