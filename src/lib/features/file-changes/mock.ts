import type { FileChange, FilePill } from "@/lib/types";

function pick<T>(arr: T[]): T {
  const v = arr[Math.floor(Math.random() * arr.length)];
  if (!v) throw new Error("pick: empty array");
  return v;
}

/** Pool of plausible files for simulation-generated changes. */
export const SIM_FILE_POOL: {
  name: string;
  language: string;
  color: FilePill["color"];
}[] = [
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

/** Fabricate a file-update message payload with 1–3 pills. */
export function randomFileUpdateMessage(_taskId: string): {
  content: string;
  files: { name: string; color: FilePill["color"] }[];
  diffAdd: number;
  diffDel: number;
} {
  const count = 1 + Math.floor(Math.random() * 3);
  const shuffled = [...SIM_FILE_POOL]
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
  return {
    content: "Updated",
    files: shuffled.map((f) => ({ name: f.name, color: f.color })),
    diffAdd: 6 + Math.floor(Math.random() * 40),
    diffDel: 1 + Math.floor(Math.random() * 8),
  };
}
