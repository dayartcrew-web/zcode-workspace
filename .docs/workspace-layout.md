# Workspace Layout

Directory-by-directory reference for **zcode-workspace**.

```
zcode-workspace/
├─ src/
│  ├─ app/                 Next.js App Router — pages, layouts, route handlers
│  │  ├─ layout.tsx         Root layout: metadata, providers, SimulationProvider
│  │  ├─ page.tsx           Home page → renders <ZCodeWorkspace/>
│  │  ├─ globals.css        Global styles + Tailwind layers
│  │  └─ api/               Route handlers (REST-ish)
│  │     ├─ route.ts              GET /api — health/info
│  │     ├─ chat/route.ts         POST /api/chat — streaming completions
│  │     └─ tasks/                Tasks resource
│  │        ├─ route.ts             GET/POST /api/tasks
│  │        └─ [id]/route.ts        GET/PATCH/DELETE /api/tasks/:id
│  │
│  ├─ components/
│  │  ├─ ui/               shadcn/ui primitives — the shared design system
│  │  │                     (button, card, dialog, dropdown-menu, table, chart,
│  │  │                      ~48 files). Compose these; extend rather than fork.
│  │  └─ zcode/            Workspace feature components (compose ui/ primitives)
│  │     ├─ zcode-workspace.tsx   Top-level 3-pane shell
│  │     ├─ left-sidebar.tsx      Project/task navigation
│  │     ├─ central-content.tsx   Composer + transcript (main pane)
│  │     ├─ right-sidebar.tsx     Context panels
│  │     ├─ settings-view.tsx     Settings UI
│  │     ├─ simulation-provider.tsx  React ctx for optional sim sidecar
│  │     └─ (feature panels: source-control, providers, connections,
│  │         keybindings, file-tree, file-diff, file-pill, remote-connect)
│  │
│  ├─ hooks/               Shared React hooks (use-mobile, use-toast)
│  │
│  └─ lib/                 Core logic boundary — no React/UI here where possible
│     ├─ store.ts           Single Zustand store, merges all feature slices
│     ├─ db.ts              Prisma client singleton
│     ├─ types.ts           Shared TypeScript types
│     ├─ utils.ts, format.ts, file-diffs.ts, keybindings.ts, providers.ts, seed-data.ts
│     └─ features/<name>/   One folder per state domain:
│           index.ts         — public exports (actions, types, slice factory)
│           slice.ts         — slice definition (state + actions)
│           mock.ts          — mock/seed data (optional)
│         Slices: chat-streaming, composer, connections, file-changes,
│                 providers, settings, simulation, source-control,
│                 task-progress, uploads
│
├─ prisma/                 Prisma schema + migrations
│  └─ schema.prisma         SQLite models: Task, Message, FileChange, ChecklistItem
│
├─ public/                 Static assets served as-is (logo.svg, robots.txt)
│
├─ mini-services/          Optional standalone sidecars (separate bun.lock)
│  └─ sim-server.ts         socket.io simulation server on :4001; streams live
│                           task events; app falls back to seed data if offline
│
├─ examples/               Reference demos (websocket) — excluded from lint/build
│
├─ scripts/                Dev/build tooling scripts
│  └─ dev-with-offset.ts    Dev runner with port-offset (concurrent instances)
│
├─ .github/                GitHub config
│  ├─ workflows/            ci.yml (quality gate), pr-size.yml (PR triage)
│  └─ pull_request_template.md
│
├─ .docs/                  Canonical architecture reference (this folder)
│  ├─ architecture.md       Stack, request flow, data model (mermaid diagrams)
│  └─ workspace-layout.md   This file
│
├─ AGENTS.md               Agent/contributor conventions (canonical)
├─ CLAUDE.md               Lean Claude-tailored distillation of AGENTS.md
├─ THIRD_PARTY_NOTICES.md  Dependency licenses + attribution notes
├─ README.md               Project overview + quickstart
│
├─ package.json            Scripts: dev, dev:sim, dev:offset, build, start, lint,
│                          db:push|generate|migrate|reset
├─ tsconfig.json           TS config: strict, @/* → ./src/*, target ES2023
├─ next.config.ts          output: "standalone"; typescript.ignoreBuildErrors: true
├─ eslint.config.mjs       ESLint 9 flat config (eslint-config-next)
├─ tailwind.config.ts      Tailwind theme
├─ postcss.config.mjs      PostCSS (Tailwind plugin)
├─ components.json         shadcn/ui config
├─ .mise.toml              Runtime pins (node + bun versions)
└─ bunfig.toml             Bun installer config (isolated linker)
```

## Path alias

`@/*` → `./src/*` (see `tsconfig.json`). Import all app-internal modules through `@/`.

## Notes

- `next.config.ts` sets `typescript.ignoreBuildErrors: true` — `next build`
  does NOT typecheck. Run `bunx tsc --noEmit` explicitly (see `AGENTS.md`).
- `mini-services/` has its own `package.json`/lockfile — it is an independent
  sidecar, not part of the main app bundle.
- `examples/` and `.masday/**` are excluded from ESLint and the build.
