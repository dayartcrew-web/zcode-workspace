# Teardown Summary

This document records the teardown of zcode-workspace from a mock-data-driven
demo into a minimal empty shell. Executed via the `teardown-to-minimal-shell`
masday workflow (5 tasks, PRs #15–#19).

## What was removed

| Layer | Removed | PR |
|---|---|---|
| **Simulation sidecar** | `mini-services/` (sim-server.ts + package.json/lock), `scripts/dev-with-offset.ts`, `dev:sim`/`dev:offset`/`sim` scripts, `socket.io-client` + `concurrently` deps, `.env.example` sim entries, `config.ts` sim fields | #15 |
| **Simulation UI** | `simulation-provider.tsx`, `useSimulation.ts`, `features/simulation/`, SimulationStatusBadge, sim ws path in composer | #16 |
| **Mock data** | 3× `mock.ts` (chat-streaming, file-changes, task-progress), `seed-data.ts` barrel, `buildTaskDetail`/`seedTasks`/`seedTaskDetail` + SIM_* exports | #17 |
| **Demo UI** | 12 components (left-sidebar, central-content, right-sidebar, settings-view, source-control-section, connections-section, providers-section, keybindings-section, file-diff-view, file-pill, file-tree-panel, remote-connect-dialog) + their menus/chrome | #18 |
| **Orphaned example** | `examples/websocket/` (demonstrated the now-removed sim sidecar) | #19 |

## What was preserved

- **Next.js app shell**: `src/app/` (layout, page, globals.css), `src/components/ui/` (shadcn primitives)
- **Prior Synara-adoption work** (all retained):
  - `src/lib/contracts/` — zod schema/contract boundary
  - `src/lib/errors.ts` — tagged AppError taxonomy
  - `src/lib/config.ts` — typed validated env config
  - `src/lib/domain/` — pure logic boundary
  - `AGENTS.md` / `CLAUDE.md` — agent-convention docs
  - `tsconfig.json` — strict (noUncheckedIndexedAccess, noImplicitOverride)
  - `vitest` + 39 passing tests
  - CI (`.github/workflows/ci.yml` + `pr-size.yml`)
  - `.docs/`, `THIRD_PARTY_NOTICES.md`
- **Prisma**: `prisma/schema.prisma` + `src/lib/db.ts` — door open for real data
- **Feature slices**: the Zustand slices (composer, connections, providers, settings, source-control, uploads, file-changes, chat-streaming, task-progress) remain composed in the store. They are currently unused by the shell UI but compile clean and are available to build on.

## Current state

- `GET /` → renders an empty workspace shell ("Empty workspace shell. Build the real interface on top of this.")
- `GET /api/tasks` → `{tasks:[]}` (empty, contract-validated)
- `GET /api/tasks/:id` → `404 {_tag:"NotFound"}` (no data source wired)
- `POST /api/tasks` → `201` (constructs a task object, no persistence)
- `tsc --noEmit`: **0 errors** (fully type-clean)
- `next build`: succeeds
- `vitest`: 39 tests pass

## To build a real app on top of this

1. Wire `GET/POST /api/tasks` and `/api/tasks/[id]` to Prisma (`src/lib/db.ts` is ready).
2. Build UI components in `src/components/` composing the preserved shadcn primitives (`src/components/ui/`).
3. Use the contract schemas (`src/lib/contracts/`) for request/response typing.
4. Map errors via `src/lib/errors.ts` AppError taxonomy.

## Notes on documentation

`.docs/architecture.md` and `.docs/workspace-layout.md` describe the *pre-teardown*
app (with sim sidecar, mock slices, demo components). They are retained as
historical reference but are not accurate to the current minimal shell. They
should be rewritten when real features are built on top of this shell.
