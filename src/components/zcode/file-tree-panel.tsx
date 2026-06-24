"use client";

import { useState } from "react";
import {
  ChevronRight,
  Folder,
  FolderOpen,
  FileCode,
  FileType2,
  FileText,
  Braces,
  FileJson,
  Hash,
  GitBranch,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NodeKind = "folder" | "file";
type FileExt =
  | "ts"
  | "tsx"
  | "rs"
  | "php"
  | "js"
  | "json"
  | "css"
  | "html"
  | "md"
  | "txt";

interface TreeNode {
  name: string;
  kind: NodeKind;
  ext?: FileExt;
  children?: TreeNode[];
}

const TREE: TreeNode[] = [
  {
    name: "src",
    kind: "folder",
    children: [
      {
        name: "components",
        kind: "folder",
        children: [
          { name: "Board.tsx", kind: "file", ext: "tsx" },
          { name: "Stone.tsx", kind: "file", ext: "tsx" },
          { name: "Scoreboard.tsx", kind: "file", ext: "tsx" },
        ],
      },
      {
        name: "ai",
        kind: "folder",
        children: [
          { name: "heuristic.ts", kind: "file", ext: "ts" },
          { name: "patterns.ts", kind: "file", ext: "ts" },
          { name: "scorer.ts", kind: "file", ext: "ts" },
        ],
      },
      {
        name: "server",
        kind: "folder",
        children: [
          { name: "main.rs", kind: "file", ext: "rs" },
          { name: "handlers.rs", kind: "file", ext: "rs" },
        ],
      },
      {
        name: "api",
        kind: "folder",
        children: [
          { name: "match.php", kind: "file", ext: "php" },
          { name: "leaderboard.php", kind: "file", ext: "php" },
        ],
      },
      { name: "app.ts", kind: "file", ext: "ts" },
      { name: "index.html", kind: "file", ext: "html" },
      { name: "styles.css", kind: "file", ext: "css" },
    ],
  },
  {
    name: "tests",
    kind: "folder",
    children: [
      { name: "heuristic.test.ts", kind: "file", ext: "ts" },
      { name: "board.test.ts", kind: "file", ext: "ts" },
    ],
  },
  { name: "package.json", kind: "file", ext: "json" },
  { name: "Cargo.toml", kind: "file", ext: "txt" },
  { name: "README.md", kind: "file", ext: "md" },
  { name: ".gitignore", kind: "file", ext: "txt" },
];

const extIcon: Record<FileExt, React.ComponentType<{ className?: string }>> = {
  ts: FileCode,
  tsx: FileCode,
  js: FileCode,
  rs: Hash,
  php: FileText,
  json: FileJson,
  css: Braces,
  html: FileType2,
  md: FileText,
  txt: FileText,
};

const extColor: Record<FileExt, string> = {
  ts: "text-[oklch(0.62_0.18_255)]",
  tsx: "text-[oklch(0.62_0.18_255)]",
  js: "text-[oklch(0.80_0.16_90)]",
  rs: "text-[oklch(0.65_0.22_25)]",
  php: "text-[oklch(0.65_0.22_305)]",
  json: FileJson ? "text-[oklch(0.72_0.18_55)]" : "text-muted-foreground",
  css: "text-[oklch(0.65_0.22_305)]",
  html: "text-[oklch(0.72_0.18_55)]",
  md: "text-[oklch(0.70_0.15_180)]",
  txt: "text-muted-foreground",
};

export function FileTreePanel() {
  return (
    <div className="flex h-full flex-col">
      {/* Sub-header */}
      <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
        <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Explorer
        </span>
      </div>

      {/* Tree */}
      <div className="scrollbar-thin flex-1 overflow-y-auto px-1.5 py-2">
        <ul className="space-y-0.5">
          {TREE.map((node) => (
            <TreeRow key={node.name} node={node} depth={0} />
          ))}
        </ul>
      </div>
    </div>
  );
}

function TreeRow({ node, depth }: { node: TreeNode; depth: number }) {
  const [open, setOpen] = useState(depth < 1);

  if (node.kind === "folder") {
    return (
      <li>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-1 rounded-md px-1.5 py-1 text-left text-xs text-foreground/90 hover:bg-accent/50"
          style={{ paddingLeft: `${depth * 12 + 6}px` }}
        >
          <ChevronRight
            className={cn(
              "h-3 w-3 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-90",
            )}
          />
          {open ? (
            <FolderOpen className="h-3.5 w-3.5 shrink-0 text-[oklch(0.72_0.18_55)]" />
          ) : (
            <Folder className="h-3.5 w-3.5 shrink-0 text-[oklch(0.72_0.18_55)]" />
          )}
          <span className="truncate">{node.name}</span>
        </button>
        {open && node.children && (
          <ul className="space-y-0.5">
            {node.children.map((child) => (
              <TreeRow key={child.name} node={child} depth={depth + 1} />
            ))}
          </ul>
        )}
      </li>
    );
  }

  const Icon = node.ext ? extIcon[node.ext] : FileText;
  const color = node.ext ? extColor[node.ext] : "text-muted-foreground";

  return (
    <li>
      <button
        className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-xs text-foreground/80 hover:bg-accent/50"
        style={{ paddingLeft: `${depth * 12 + 6 + 16}px` }}
      >
        <Icon className={cn("h-3.5 w-3.5 shrink-0", color)} />
        <span className="truncate">{node.name}</span>
      </button>
    </li>
  );
}
