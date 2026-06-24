import type {
  FileChange,
  FilePill,
  TaskDetail,
  WorkspaceMessage,
  WorkspaceTask,
} from "./types";

// Seed data matching the ZCode screenshot exactly
// Tasks shown in the left sidebar (most recent first)
export const seedTasks: WorkspaceTask[] = [
  {
    id: "task-gomoku",
    title: "Create an intelligent Gomoku (Five-in-a-Row) game where the AI uses a heuristic algorithm to play against the human player",
    tags: ["gomoku-ai", "upgrade/v3.0"],
    branch: "feat/gomoku-ai",
    project: "gomoku-ai",
    goal: "Gomoku vs. AI — implement computer moves with a heuristic algorithm",
    status: "active",
    model: "GLM-5.2",
    tokensUsed: 89000,
    stepCount: 5,
    totalSteps: 5,
    duration: "2m",
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: "task-start-prompts",
    title: "Refine start prompts, tune temperature, and ship a friendlier first message for new chats",
    tags: ["prompts", "ux"],
    branch: "feat/onboarding-prompts",
    project: "onboarding",
    goal: "Rewrite onboarding prompts with warmer tone and better examples",
    status: "active",
    model: "GLM-5.2",
    tokensUsed: 41200,
    stepCount: 3,
    totalSteps: 4,
    duration: "9m",
    createdAt: new Date(Date.now() - 9 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 9 * 60 * 1000).toISOString(),
  },
  {
    id: "task-heuristic-ai",
    title: "Wire in heuristic AI turn scoring with offensive and defensive pattern weights",
    tags: ["gomoku-ai", "ai-logic"],
    branch: "feat/gomoku-ai",
    project: "gomoku-ai",
    goal: "Score candidate moves using offensive/defensive heuristics",
    status: "active",
    model: "GLM-5.2",
    tokensUsed: 27800,
    stepCount: 4,
    totalSteps: 5,
    duration: "14m",
    createdAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
  },
  {
    id: "task-board-scaling",
    title: "Adapt board scaling and portrait/landscape layout for mobile devices",
    tags: ["gomoku-ai", "responsive"],
    branch: "feat/gomoku-ai",
    project: "gomoku-ai",
    goal: "Make the 15x15 board scale cleanly on phones in both orientations",
    status: "complete",
    model: "GLM-5.2",
    tokensUsed: 18900,
    stepCount: 3,
    totalSteps: 3,
    duration: "27m",
    createdAt: new Date(Date.now() - 27 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 27 * 60 * 1000).toISOString(),
  },
  {
    id: "task-hero-visual",
    title: "Refresh hero visual wording so it reads like a product, not a placeholder",
    tags: ["homepage", "copy"],
    branch: "feat/homepage-refresh",
    project: "homepage-refresh",
    goal: "Rewrite the hero block headline + subhead",
    status: "active",
    model: "GLM-5.2",
    tokensUsed: 12400,
    stepCount: 2,
    totalSteps: 3,
    duration: "33m",
    createdAt: new Date(Date.now() - 33 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 33 * 60 * 1000).toISOString(),
  },
  {
    id: "task-homepage-en",
    title: "Tighten homepage English copy for tone, rhythm, and parallel structure",
    tags: ["homepage", "copy", "i18n"],
    branch: "feat/homepage-refresh",
    project: "homepage-refresh",
    goal: "Polish English strings across the marketing site",
    status: "complete",
    model: "GLM-5.2",
    tokensUsed: 9800,
    stepCount: 4,
    totalSteps: 4,
    duration: "42m",
    createdAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
  },
  {
    id: "task-hero-breakpoints",
    title: "Tune hero breakpoints for tablet sizes between 768px and 1024px",
    tags: ["homepage", "responsive"],
    branch: "feat/homepage-refresh",
    project: "homepage-refresh",
    goal: "Add a tablet-specific hero treatment",
    status: "active",
    model: "GLM-5.2",
    tokensUsed: 7600,
    stepCount: 1,
    totalSteps: 2,
    duration: "1h",
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: "task-pricing-faq",
    title: "Add pricing FAQ content covering plan limits, refunds, and team seats",
    tags: ["pricing", "content"],
    branch: "feat/pricing-faq",
    project: "pricing-faq",
    goal: "Ship a 10-question pricing FAQ section",
    status: "active",
    model: "GLM-5.2",
    tokensUsed: 15200,
    stepCount: 3,
    totalSteps: 3,
    duration: "2h",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "task-docs-search",
    title: "Improve docs search highlight matching so snippets feel more relevant",
    tags: ["docs", "search"],
    branch: "feat/docs-search",
    project: "docs-search",
    goal: "Better snippet ranking + visual highlight",
    status: "archived",
    model: "GLM-5.2",
    tokensUsed: 21000,
    stepCount: 2,
    totalSteps: 4,
    duration: "5h",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "zcode-desktop",
    title: "zcode-desktop",
    tags: [],
    branch: "main",
    project: "zcode-desktop",
    goal: "Repository root workspace",
    status: "active",
    model: "GLM-5.2",
    tokensUsed: 0,
    stepCount: 0,
    totalSteps: 0,
    duration: "—",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Detail for the active Gomoku task (matches screenshot center panel)
export const seedTaskDetail: TaskDetail = {
  ...seedTasks[0],
  messages: [
    {
      id: "msg-u1",
      taskId: "task-gomoku",
      role: "user",
      kind: "text",
      content:
        "Can you build a Gomoku game that runs fully offline in the browser, with an AI that actually plays well instead of moving randomly?",
      diffAdd: 0,
      diffDel: 0,
      createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    },
    {
      id: "msg-1",
      taskId: "task-gomoku",
      role: "assistant",
      kind: "command",
      content:
        "I found one avoidable dependency: the page was pulling a web font. I'm removing that so the game stays fully local and works by opening index.html with no network requirement.",
      command: "Ran node —check app.js",
      diffAdd: 0,
      diffDel: 0,
      createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    },
    {
      id: "msg-2",
      taskId: "task-gomoku",
      role: "assistant",
      kind: "file-update",
      content: "Updated",
      files: [
        { name: "styles.css", color: "purple" },
        { name: "index.html", color: "orange" },
      ],
      diffAdd: 0,
      diffDel: 7,
      createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    },
    {
      id: "msg-3",
      taskId: "task-gomoku",
      role: "assistant",
      kind: "description",
      content:
        "Built a standalone browser Gomoku game in index.html, styles.css, and app.js. It renders a 15x15 board, lets the player place black stones, detects wins in all four directions, highlights the winning line, tracks turns and move count, and supports restarting the match.",
      diffAdd: 0,
      diffDel: 0,
      createdAt: new Date(Date.now() - 90 * 1000).toISOString(),
    },
    {
      id: "msg-4",
      taskId: "task-gomoku",
      role: "assistant",
      kind: "description",
      content:
        "The AI is heuristic rather than random. It searches nearby candidate moves, scores offensive patterns for itself, scores defensive blocks against the player, adds center preference, and chooses the strongest move. There's also an optional 'AI focus area' overlay so you can see the strongest candidate points it considered.",
      diffAdd: 0,
      diffDel: 0,
      createdAt: new Date(Date.now() - 80 * 1000).toISOString(),
    },
  ],
  fileChanges: [
    {
      id: "fc-1",
      taskId: "task-gomoku",
      name: "app.js",
      language: "javascript",
      diffAdd: 471,
      diffDel: 0,
    },
    {
      id: "fc-2",
      taskId: "task-gomoku",
      name: "index.html",
      language: "html",
      diffAdd: 62,
      diffDel: 6,
    },
    {
      id: "fc-3",
      taskId: "task-gomoku",
      name: "styles.css",
      language: "css",
      diffAdd: 201,
      diffDel: 1,
    },
  ],
  checklist: [
    {
      id: "ci-1",
      taskId: "task-gomoku",
      text: "Adapt board scaling and portrait/landscape layout for mobile",
      done: true,
      order: 0,
    },
    {
      id: "ci-2",
      taskId: "task-gomoku",
      text: "Add rules copy, restart entry points, and empty-state guidance",
      done: true,
      order: 1,
    },
    {
      id: "ci-3",
      taskId: "task-gomoku",
      text: "Score candidate moves using offensive/defensive heuristics",
      done: true,
      order: 2,
    },
    {
      id: "ci-4",
      taskId: "task-gomoku",
      text: "Add optional AI focus-area overlay showing considered points",
      done: true,
      order: 3,
    },
    {
      id: "ci-5",
      taskId: "task-gomoku",
      text: "Remove external web font dependency for offline play",
      done: true,
      order: 4,
    },
  ],
};

// Lightweight detail builder for the other tasks (so the center panel
// always has plausible content when you switch tasks)
export function buildTaskDetail(task: WorkspaceTask): TaskDetail {
  if (task.id === "task-gomoku") return seedTaskDetail;

  const msgs: TaskDetail["messages"] = [
    {
      id: `${task.id}-u1`,
      taskId: task.id,
      role: "user",
      kind: "text",
      content: `Let's work on: ${task.goal}. Start with the smallest safe change set.`,
      diffAdd: 0,
      diffDel: 0,
      createdAt: task.updatedAt,
    },
    {
      id: `${task.id}-m1`,
      taskId: task.id,
      role: "assistant",
      kind: "command",
      content: `Kicked off work on "${task.title}". Reading the relevant files and planning the smallest safe change set.`,
      command: `Ran git checkout -b ${task.branch}`,
      diffAdd: 0,
      diffDel: 0,
      createdAt: task.updatedAt,
    },
    {
      id: `${task.id}-m2`,
      taskId: task.id,
      role: "assistant",
      kind: "file-update",
      content: "Updated",
      files: [
        { name: "index.ts", color: "blue" },
        { name: "README.md", color: "blue" },
      ],
      diffAdd: 94,
      diffDel: 11,
      createdAt: task.updatedAt,
    },
    {
      id: `${task.id}-m3`,
      taskId: task.id,
      role: "assistant",
      kind: "description",
      content: `Planned ${task.totalSteps} steps for this task. So far completed ${task.stepCount}. Continuing with the next item from the checklist.`,
      diffAdd: 0,
      diffDel: 0,
      createdAt: task.updatedAt,
    },
  ];

  const files: TaskDetail["fileChanges"] = [
    {
      id: `${task.id}-f1`,
      taskId: task.id,
      name: "README.md",
      language: "markdown",
      diffAdd: 18,
      diffDel: 2,
    },
    {
      id: `${task.id}-f2`,
      taskId: task.id,
      name: "index.ts",
      language: "typescript",
      diffAdd: 94,
      diffDel: 11,
    },
    {
      id: `${task.id}-f3`,
      taskId: task.id,
      name: "styles.css",
      language: "css",
      diffAdd: 42,
      diffDel: 5,
    },
  ];

  const checklist: TaskDetail["checklist"] = Array.from(
    { length: task.totalSteps },
    (_, i) => ({
      id: `${task.id}-c${i}`,
      taskId: task.id,
      text: checklistTextFor(task, i),
      done: i < task.stepCount,
      order: i,
    }),
  );

  return { ...task, messages: msgs, fileChanges: files, checklist };
}

function checklistTextFor(task: WorkspaceTask, i: number): string {
  const base: Record<string, string[]> = {
    "task-start-prompts": [
      "Audit existing first-message templates",
      "Draft warmer welcome copy in two tones",
      "A/B test against current prompts",
      "Ship winning variant to production",
    ],
    "task-heuristic-ai": [
      "Define offensive pattern weights",
      "Define defensive pattern weights",
      "Implement candidate-move search",
      "Add center preference bonus",
      "Wire heuristic into the AI turn loop",
    ],
    "task-board-scaling": [
      "Add viewport-based sizing helper",
      "Handle portrait orientation",
      "Handle landscape orientation",
    ],
    "task-hero-visual": [
      "Review current hero copy",
      "Propose three headline options",
      "Pick and integrate winner",
    ],
    "task-homepage-en": [
      "Extract all English strings",
      "Rewrite for tone and rhythm",
      "Apply parallel structure",
      "Proofread final pass",
    ],
    "task-hero-breakpoints": [
      "Audit current breakpoints",
      "Add tablet-specific hero treatment",
    ],
    "task-pricing-faq": [
      "Draft FAQ question list",
      "Write answers with links",
      "Add FAQ section to pricing page",
    ],
    "task-docs-search": [
      "Inspect current ranking signals",
      "Tune snippet relevance scoring",
      "Add visual highlight markup",
      "Validate with sample queries",
    ],
  };
  const list = base[task.id] ?? ["Step " + (i + 1)];
  return list[i] ?? `Step ${i + 1}`;
}

/* ------------------------------------------------------------------ *
 * Shared simulation helpers
 *
 * Used by the websocket sidecar (mini-services/sim-server.ts) to fabricate
 * realistic events. Kept here so the server and the seed data share the same
 * vocabulary and shapes. Pure functions, no side effects.
 * ------------------------------------------------------------------ */

export const SIM_FILE_POOL: { name: string; language: string; color: FilePill["color"] }[] = [
  { name: "index.ts", language: "typescript", color: "blue" },
  { name: "app.js", language: "javascript", color: "yellow" },
  { name: "styles.css", language: "css", color: "purple" },
  { name: "index.html", language: "html", color: "orange" },
  { name: "README.md", language: "markdown", color: "blue" },
  { name: "api.ts", language: "typescript", color: "blue" },
  { name: "utils.ts", language: "typescript", color: "blue" },
  { name: "config.json", language: "json", color: "green" },
  { name: "Button.tsx", language: "typescript", color: "blue" },
  { name: "theme.css", language: "css", color: "purple" },
];

export const SIM_ASSISTANT_LINES: string[] = [
  "I'll start by reading the relevant files to understand the current structure.",
  "Found a small issue. I'm refactoring this so the logic is easier to follow.",
  "Adding a guard clause to handle the empty case before computing the result.",
  "I'm extracting the shared helper into its own module to avoid duplication.",
  "Updating the types so the new field is validated end to end.",
  "Writing a focused test that covers the edge case you mentioned.",
  "Optimizing this loop — the previous version scanned the full list on each call.",
  "I'll wire this into the UI now so you can preview the change live.",
  "Cleaning up the leftover debug logging from the last iteration.",
  "Re-running the suite to confirm nothing regressed.",
];

export const SIM_COMMANDS: string[] = [
  "Ran npm run lint",
  "Ran npm test",
  "Ran git diff --stat",
  "Ran tsc --noEmit",
  "Ran prettier --check .",
  "Ran node —check app.js",
  "Ran git status",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Fabricate a plausible assistant plan message (used for streamed replies). */
export function randomAssistantPlan(task: WorkspaceTask): string {
  const lead = pick(SIM_ASSISTANT_LINES);
  const tail = pick([
    `Then I'll apply the change to ${task.branch} and show you the diff.`,
    `This keeps the change minimal and safe for ${task.goal.toLowerCase()}.`,
    `Let me know if you'd like me to take a different approach here.`,
    `I'll commit it once the checklist for this task is complete.`,
  ]);
  return `${lead} ${tail}`;
}

/** Fabricate a file-update message with 1–3 pills. */
export function randomFileUpdateMessage(
  taskId: string,
): Pick<WorkspaceMessage, "content" | "files" | "diffAdd" | "diffDel"> {
  const count = 1 + Math.floor(Math.random() * 3);
  const shuffled = [...SIM_FILE_POOL].sort(() => Math.random() - 0.5).slice(0, count);
  return {
    content: "Updated",
    files: shuffled.map((f) => ({ name: f.name, color: f.color })),
    diffAdd: 6 + Math.floor(Math.random() * 40),
    diffDel: 1 + Math.floor(Math.random() * 8),
  };
}

/** Fabricate a new FileChange row (for the right-panel changes list). */
export function randomFileChange(taskId: string): FileChange {
  const f = pick(SIM_FILE_POOL);
  return {
    id: `fc-${taskId}-${Date.now()}-${Math.floor(Math.random() * 1e4)}`,
    taskId,
    name: f.name,
    language: f.language,
    diffAdd: 10 + Math.floor(Math.random() * 120),
    diffDel: Math.floor(Math.random() * 20),
  };
}

/** Fabricate a brand-new task (for the left-sidebar new-task animation). */
export function randomNewTask(now = Date.now()): WorkspaceTask {
  const titles = [
    "Add keyboard shortcut to toggle the AI focus overlay",
    "Refactor the board renderer to use a canvas backing store",
    "Improve win-detection perf for very large boards",
    "Add a dark-mode variant for the marketing hero",
    "Cache the docs search index in localStorage",
  ];
  const total = 3 + Math.floor(Math.random() * 3);
  return {
    id: `task-sim-${now}-${Math.floor(Math.random() * 1e4)}`,
    title: pick(titles),
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
}

