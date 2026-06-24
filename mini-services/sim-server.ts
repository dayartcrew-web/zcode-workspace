/**
 * zcode-workspace — live simulation websocket sidecar.
 *
 * Mirrors the pattern in ../examples/websocket/server.ts:
 *   - socket.io server, path: '/' (DO NOT change — Caddy relies on it)
 *   - routed by the Next.js client via /?XTransformPort=<PORT>
 *   - Caddy's @transform_port_query matcher proxies to localhost:<PORT>
 *
 * Run:  bun run sim-server.ts   (or: npm run start:tsx)
 * Port: 4001 (override with SIM_PORT env var)
 *
 * The app connects with:
 *   io("/?XTransformPort=4001", { transports: ["websocket","polling"], ... })
 *
 * Emits (server -> client):
 *   sim:state        { running }                  snapshot on connect
 *   sim:chat-start   { taskId, messageId, role }
 *   sim:chat-token   { taskId, messageId, token }
 *   sim:chat-end     { taskId, messageId, content, tokensUsed }
 *   sim:task-progress { taskId, stepCount, tokensUsed, checklistDone }
 *   sim:file-change  { taskId, file }
 *   sim:new-task     { task }
 *   sim:upload       { id, name, progress, done }
 *
 * Listens (client -> server):
 *   sim:start        resume the tick loop
 *   sim:pause        pause the tick loop
 *   sim:set-active   { taskId }  target events at the viewed task
 *   sim:request-chat { taskId, prompt }  stream a reply for a user message
 */

import { createServer } from "node:http";
import { Server } from "socket.io";

const PORT = Number(process.env.SIM_PORT ?? 4001);
const TICK_MS = 1400; // baseline cadence between events

/* ----------------------------- shared content ----------------------------- */
// Kept inline so the sidecar has no build dependency on the Next.js app.
// Mirrors the helpers in ../src/lib/seed-data.ts.

interface FileChangeLike {
  id: string;
  name: string;
  language: string;
  diffAdd: number;
  diffDel: number;
}
interface TaskLike {
  id: string;
  title: string;
  branch: string;
  goal: string;
  status: string;
  model: string;
  tokensUsed: number;
  stepCount: number;
  totalSteps: number;
}

const FILE_POOL = [
  { name: "index.ts", language: "typescript", color: "blue" as const },
  { name: "app.js", language: "javascript", color: "yellow" as const },
  { name: "styles.css", language: "css", color: "purple" as const },
  { name: "index.html", language: "html", color: "orange" as const },
  { name: "README.md", language: "markdown", color: "blue" as const },
  { name: "api.ts", language: "typescript", color: "blue" as const },
  { name: "Button.tsx", language: "typescript", color: "blue" as const },
];

const ASSISTANT_LINES = [
  "I'll start by reading the relevant files to understand the current structure.",
  "Found a small issue — refactoring so the logic is easier to follow.",
  "Adding a guard clause to handle the empty case before computing the result.",
  "Extracting the shared helper into its own module to avoid duplication.",
  "Updating the types so the new field is validated end to end.",
  "Writing a focused test that covers the edge case you mentioned.",
  "Optimizing this loop — the previous version scanned the full list each call.",
  "Wiring this into the UI now so you can preview the change live.",
];

const COMMANDS = [
  "Ran npm run lint",
  "Ran npm test",
  "Ran git diff --stat",
  "Ran tsc --noEmit",
  "Ran prettier --check .",
];

const NEW_TASK_TITLES = [
  "Add keyboard shortcut to toggle the AI focus overlay",
  "Refactor the board renderer to use a canvas backing store",
  "Add a dark-mode variant for the marketing hero",
  "Cache the docs search index in localStorage",
  "Improve win-detection perf for very large boards",
];

function pick<T>(arr: T[]): T {
  const v = arr[Math.floor(Math.random() * arr.length)];
  if (!v) throw new Error("pick: empty array");
  return v;
}
function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

const SEED_TASKS: TaskLike[] = [
  {
    id: "task-gomoku",
    title: "Create an intelligent Gomoku game where the AI uses a heuristic algorithm",
    branch: "feat/gomoku-ai",
    goal: "Gomoku vs. AI with a heuristic move scorer",
    status: "active",
    model: "GLM-5.2",
    tokensUsed: 89000,
    stepCount: 3,
    totalSteps: 5,
  },
  {
    id: "task-start-prompts",
    title: "Refine start prompts and ship a friendlier first message",
    branch: "feat/onboarding-prompts",
    goal: "Warmer onboarding prompts",
    status: "active",
    model: "GLM-5.2",
    tokensUsed: 41200,
    stepCount: 3,
    totalSteps: 4,
  },
  {
    id: "task-heuristic-ai",
    title: "Wire in heuristic AI turn scoring with offensive and defensive weights",
    branch: "feat/gomoku-ai",
    goal: "Score candidate moves with heuristics",
    status: "active",
    model: "GLM-5.2",
    tokensUsed: 27800,
    stepCount: 4,
    totalSteps: 5,
  },
  {
    id: "task-hero-visual",
    title: "Refresh hero visual wording so it reads like a product",
    branch: "feat/homepage-refresh",
    goal: "Rewrite the hero headline + subhead",
    status: "active",
    model: "GLM-5.2",
    tokensUsed: 12400,
    stepCount: 2,
    totalSteps: 3,
  },
];

/* ------------------------------- sim engine ------------------------------- */

const simState = {
  running: true,
  activeTaskId: SEED_TASKS[0]?.id ?? "task-gomoku",
  // per-task mutable counters, keyed by task id
  progress: new Map<string, { tokens: number; step: number; doneIds: Set<string> }>(),
};

for (const t of SEED_TASKS) {
  simState.progress.set(t.id, {
    tokens: t.tokensUsed,
    step: t.stepCount,
    doneIds: new Set(),
  });
}

function getProgress(taskId: string) {
  let p = simState.progress.get(taskId);
  if (!p) {
    p = { tokens: 0, step: 0, doneIds: new Set() };
    simState.progress.set(taskId, p);
  }
  return p;
}

function activeTask(): TaskLike {
  return SEED_TASKS.find((t) => t.id === simState.activeTaskId) ?? SEED_TASKS[0]!;
}

/** Stream a full assistant message token-by-token to a single socket (or io). */
function streamMessage(emitter: { emit: (e: string, p: unknown) => void }, taskId: string, text: string) {
  const messageId = uid("msg");
  const words = text.split(" ");
  emitter.emit("sim:chat-start", { taskId, messageId, role: "assistant" });

  let i = 0;
  const iv = setInterval(() => {
    if (i >= words.length) {
      clearInterval(iv);
      const tokens = 60 + Math.floor(Math.random() * 180);
      emitter.emit("sim:chat-end", { taskId, messageId, content: text, tokensUsed: tokens });
      // accrue tokens on the task
      const p = getProgress(taskId);
      p.tokens += tokens;
      return;
    }
    // emit a couple of words per tick for a smooth-but-visible stream
    const chunk = words.slice(i, i + 2).join(" ") + " ";
    emitter.emit("sim:chat-token", { taskId, messageId, token: chunk });
    i += 2;
  }, 110);
}

/**
 * Stream a short "Updated" prefix, then finalize as a FILE-UPDATE message
 * (with file pills + diff badge) rather than plain text, so the UI renders
 * the rich file-update card instead of a text paragraph.
 */
function streamFileUpdate(
  emitter: { emit: (e: string, p: unknown) => void },
  taskId: string,
  file: { name: string; color: string },
  diffAdd: number,
  diffDel: number,
  command: string,
) {
  const messageId = uid("msg");
  const prefix = "Updated ";
  emitter.emit("sim:chat-start", { taskId, messageId, role: "assistant" });
  emitter.emit("sim:chat-token", { taskId, messageId, token: prefix });

  setTimeout(() => {
    const tokens = 40 + Math.floor(Math.random() * 120);
    emitter.emit("sim:chat-end-update", {
      taskId,
      messageId,
      content: "Updated",
      files: [file],
      diffAdd,
      diffDel,
      command,
      tokensUsed: tokens,
    });
    const p = getProgress(taskId);
    p.tokens += tokens;
  }, 450);
}

/**
 * Stream a COMMAND message — the UI renders the command as a mono chip with a
 * green check, followed by the explanation paragraph. Adds variety beyond the
 * plain description messages.
 */
function streamCommand(
  emitter: { emit: (e: string, p: unknown) => void },
  taskId: string,
  command: string,
  explanation: string,
) {
  const messageId = uid("msg");
  emitter.emit("sim:chat-start", { taskId, messageId, role: "assistant" });
  const words = explanation.split(" ");
  let i = 0;
  const iv = setInterval(() => {
    if (i >= words.length) {
      clearInterval(iv);
      const tokens = 50 + Math.floor(Math.random() * 140);
      emitter.emit("sim:chat-end-command", {
        taskId,
        messageId,
        content: explanation,
        command,
        tokensUsed: tokens,
      });
      const p = getProgress(taskId);
      p.tokens += tokens;
      return;
    }
    const chunk = words.slice(i, i + 2).join(" ") + " ";
    emitter.emit("sim:chat-token", { taskId, messageId, token: chunk });
    i += 2;
  }, 110);
}

/** Weighted random event emitted on each tick. */
function emitTick(io: Server) {
  if (!simState.running) return;
  const task = activeTask();
  const roll = Math.random();

  if (roll < 0.34) {
    // AI chat streaming (most frequent — keeps the conversation alive).
    // Mix plain descriptions with command messages for visual variety.
    if (Math.random() < 0.5) {
      streamCommand(io, task.id, pick(COMMANDS), pick(ASSISTANT_LINES));
    } else {
      streamMessage(io, task.id, pick(ASSISTANT_LINES));
    }
  } else if (roll < 0.6) {
    // task progress
    const p = getProgress(task.id);
    if (p.step < task.totalSteps) p.step += 1;
    p.tokens += 200 + Math.floor(Math.random() * 1200);
    const seed = SEED_TASKS.find((t) => t.id === task.id);
    const doneIds: string[] = [];
    const total = seed?.totalSteps ?? task.totalSteps;
    for (let k = 0; k < p.step; k++) {
      const id = `${task.id}-sim-c${k}`;
      if (!p.doneIds.has(id)) {
        p.doneIds.add(id);
        doneIds.push(id);
      }
    }
    io.emit("sim:task-progress", {
      taskId: task.id,
      stepCount: p.step,
      totalSteps: total,
      tokensUsed: p.tokens,
      checklistDone: doneIds,
    });
  } else if (roll < 0.78) {
    // file change — registers a FileChange row AND streams a proper file-update
    // message (with file pills + diff badge), not a plain-text note.
    const f = pick(FILE_POOL);
    const diffAdd = 10 + Math.floor(Math.random() * 120);
    const diffDel = Math.floor(Math.random() * 20);
    const file: FileChangeLike = {
      id: uid("fc"),
      name: f.name,
      language: f.language,
      diffAdd,
      diffDel,
    };
    io.emit("sim:file-change", { taskId: task.id, file });
    setTimeout(
      () =>
        streamFileUpdate(
          io,
          task.id,
          { name: f.name, color: f.color },
          diffAdd,
          diffDel,
          pick(COMMANDS),
        ),
      600,
    );
  } else if (roll < 0.9) {
    // upload progress
    const f = pick(FILE_POOL);
    const id = uid("up");
    io.emit("sim:upload", { id, name: f.name, progress: 0, done: false });
    let pct = 0;
    const iv = setInterval(() => {
      pct += 8 + Math.floor(Math.random() * 22);
      if (pct >= 100) {
        clearInterval(iv);
        io.emit("sim:upload", { id, name: f.name, progress: 100, done: true });
        return;
      }
      io.emit("sim:upload", { id, name: f.name, progress: pct, done: false });
    }, 420);
  } else {
    // new task appears in the sidebar
    const total = 3 + Math.floor(Math.random() * 3);
    const now = Date.now();
    const newTask = {
      id: uid("task-sim"),
      title: pick(NEW_TASK_TITLES),
      tags: ["simulated"],
      branch: `feat/sim-${Math.floor(Math.random() * 1000)}`,
      project: "simulation",
      goal: "Live-simulated task generated by the websocket sidecar",
      status: "active",
      model: pick(["GLM-5.2", "Claude Sonnet 4.6", "GPT-5.4"]),
      tokensUsed: 0,
      stepCount: 0,
      totalSteps: total,
      duration: "0m",
      createdAt: new Date(now).toISOString(),
      updatedAt: new Date(now).toISOString(),
    };
    simState.progress.set(newTask.id, { tokens: 0, step: 0, doneIds: new Set() });
    io.emit("sim:new-task", { task: newTask });
  }
}

/* --------------------------------- server --------------------------------- */

const httpServer = createServer();
const io = new Server(httpServer, {
  // DO NOT change the path — Caddy uses it to forward the request by port.
  path: "/",
  cors: { origin: "*", methods: ["GET", "POST"] },
  pingTimeout: 60000,
  pingInterval: 25000,
});

let tickHandle: NodeJS.Timeout | null = null;

function ensureTicking() {
  if (tickHandle) return;
  tickHandle = setInterval(() => emitTick(io), TICK_MS);
}

io.on("connection", (socket) => {
  console.log(`[sim] client connected: ${socket.id}`);

  // Send an instant snapshot so the UI can hydrate + flip to "connected".
  socket.emit("sim:state", { running: simState.running, port: PORT });
  // Greet with a streamed message shortly after connect so the dashboard feels alive.
  setTimeout(() => {
    const t = activeTask();
    streamMessage(socket, t.id, pick(ASSISTANT_LINES));
  }, 800);

  ensureTicking();

  socket.on("sim:start", () => {
    simState.running = true;
    ensureTicking();
    io.emit("sim:state", { running: true });
    console.log("[sim] resumed");
  });

  socket.on("sim:pause", () => {
    simState.running = false;
    io.emit("sim:state", { running: false });
    console.log("[sim] paused");
  });

  socket.on("sim:set-active", ({ taskId }: { taskId: string }) => {
    simState.activeTaskId = taskId;
    console.log(`[sim] active task -> ${taskId}`);
  });

  // When the user sends a message in the composer, stream a realistic reply.
  socket.on("sim:request-chat", ({ taskId, prompt }: { taskId: string; prompt: string }) => {
    const line = `Looking at "${prompt.slice(0, 60) || "your request"}". ${pick(ASSISTANT_LINES)}`;
    streamMessage(socket, taskId, line);
  });

  socket.on("disconnect", (reason) => {
    console.log(`[sim] client disconnected: ${socket.id} (${reason})`);
  });
  socket.on("error", (err) => console.error("[sim] socket error:", err));
});

httpServer.listen(PORT, () => {
  console.log(`✅ zcode sim sidecar listening on http://localhost:${PORT}`);
  console.log(`   Connect from the app via  /?XTransformPort=${PORT}`);
});

function shutdown() {
  console.log("\n[sim] shutting down…");
  if (tickHandle) clearInterval(tickHandle);
  io.close(() => httpServer.close(() => process.exit(0)));
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
