# zcode-workspace — live simulation sidecar

A small **socket.io** server that makes the dashboard feel alive by emitting
realistic, real-time events: AI chat streaming, task progress, file changes,
new tasks, and file uploads.

It is **optional**. If it isn't running, the Next.js app keeps working exactly
as before on static seed data (the websocket connect simply times out and the
UI shows an "offline" indicator).

## Run

This service has its own `package.json` so it doesn't touch the main app deps.

```bash
cd mini-services
bun install            # or: npm install
bun run sim-server.ts  # or: npm run start:tsx  (uses tsx)
```

You should see:

```
✅ zcode sim sidecar listening on http://localhost:4001
   Connect from the app via  /?XTransformPort=4001
```

Then start the dashboard from the project root:

```bash
cd ..
bun dev                # next dev on :3000
```

Open http://localhost:3000 — within ~3s the live indicator turns green and
events begin (assistant typing, progress filling, file rows appearing, upload
bars animating).

## Port & routing contract

| Component      | Port  | Notes                                              |
|----------------|-------|----------------------------------------------------|
| Next.js app    | 3000  | Caddy's default `handle` backend                   |
| **Sim sidecar**| 4001  | reached by the app via `/?XTransformPort=4001`     |
| Caddy (public) | 81    | optional reverse proxy (see root `Caddyfile`)      |

The sidecar uses `path: '/'` (do **not** change it — Caddy relies on it) and is
reached the same way as the `examples/websocket` demo: the client connects to
the same origin the page is served from, passing the backend port as the
`XTransformPort` query param. Caddy's `@transform_port_query` matcher proxies
`localhost:<that port>`.

Override the port with the `SIM_PORT` env var if needed (and update the client
`XTransformPort` value to match).

## Event protocol

**Server → client**

| Event             | Payload                                                        | Effect                                            |
|-------------------|----------------------------------------------------------------|---------------------------------------------------|
| `sim:state`       | `{ running, port }`                                            | snapshot on connect; flips UI to "connected"      |
| `sim:chat-start`  | `{ taskId, messageId, role }`                                  | show typing indicator, begin streamed message     |
| `sim:chat-token`  | `{ taskId, messageId, token }`                                 | append token to the in-flight message             |
| `sim:chat-end`    | `{ taskId, messageId, content, tokensUsed }`                   | finalize message, accrue tokens                   |
| `sim:task-progress` | `{ taskId, stepCount, totalSteps, tokensUsed, checklistDone }` | fill progress bar, check items, count tokens up |
| `sim:file-change` | `{ taskId, file }`                                             | add/update a file-change row                       |
| `sim:new-task`    | `{ task }`                                                     | new task appears in the left sidebar               |
| `sim:upload`      | `{ id, name, progress, done }`                                 | animate an upload progress bar                     |

**Client → server**

| Event             | Payload                    | Effect                                   |
|-------------------|----------------------------|------------------------------------------|
| `sim:start`       | —                          | resume the tick loop                     |
| `sim:pause`       | —                          | pause the tick loop                      |
| `sim:set-active`  | `{ taskId }`               | target events at the currently viewed task |
| `sim:request-chat`| `{ taskId, prompt }`       | stream a realistic reply to a user message |

## Graceful fallback

The client hook (`../src/lib/useSimulation.ts`) treats a failed/slow connect as
"offline" and the app continues on seed data. The composer also retains its
original `/api/chat` fallback, so sending a message always works.
