"use client";

import { ArrowLeft, FileCode, FileType2, Braces, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/lib/store";
import { fileDiffs, type DiffLine, type FileDiff } from "@/lib/file-diffs";
import { fileLanguageColor } from "@/lib/format";
import { FilePill, DiffBadge } from "./file-pill";
import type { FileChange } from "@/lib/types";

const iconForLanguage: Record<string, React.ComponentType<{ className?: string }>> = {
  javascript: FileCode,
  html: FileType2,
  css: Braces,
  typescript: FileCode,
  markdown: FileText,
};

// Build a plausible fallback diff for files without hand-written hunks.
function buildFallbackDiff(fc: FileChange): FileDiff {
  const lines: DiffLine[] = [
    { type: "hunk", content: `@@ -1,${Math.max(fc.diffDel, 1)} +1,${Math.max(fc.diffAdd, 1)} @@` },
  ];

  const delCount = Math.min(fc.diffDel, 4);
  for (let i = 0; i < delCount; i++) {
    lines.push({
      type: "del",
      oldNo: i + 1,
      content: fallbackDelLine(fc.language, i),
    });
  }

  const addCount = Math.min(fc.diffAdd, 18);
  for (let i = 0; i < addCount; i++) {
    lines.push({
      type: "add",
      newNo: i + 1,
      content: fallbackAddLine(fc.name, fc.language, i),
    });
  }

  return {
    fileId: fc.id,
    name: fc.name,
    language: fc.language,
    diffAdd: fc.diffAdd,
    diffDel: fc.diffDel,
    hiddenLines: Math.max(0, fc.diffAdd - addCount),
    lines,
  };
}

function fallbackDelLine(language: string, i: number): string {
  switch (language.toLowerCase()) {
    case "typescript":
    case "js":
    case "javascript":
      return [
        "export function legacyHandler(req, res) {",
        "  return res.status(200).send('ok');",
        "}",
      ][i] ?? "// old code";
    case "markdown":
    case "md":
      return ["## Old section", "TODO: rewrite this."][i] ?? "old line";
    default:
      return ["// previous implementation", "// to be replaced"][i] ?? "old line";
  }
}

function fallbackAddLine(name: string, language: string, i: number): string {
  switch (language.toLowerCase()) {
    case "typescript":
    case "js":
    case "javascript":
      return [
        `// ${name} — updated implementation`,
        "import { createHandler } from './core';",
        "",
        "export const handler = createHandler({",
        "  async resolve(req) {",
        "    const result = await process(req);",
        "    return { ok: true, result };",
        "  },",
        "});",
        "",
        "async function process(req) {",
        "  // validate + transform",
        "  return req.body;",
        "}",
      ][i] ?? `  // line ${i + 1}`;
    case "markdown":
    case "md":
      return [
        `# ${name.replace(/\.(md|markdown)$/i, "")}`,
        "",
        "## Overview",
        "",
        "This module was updated as part of the task.",
        "",
        "## Usage",
        "",
        "```ts",
        "import { handler } from './handler';",
        "```",
        "",
        "## Notes",
        "",
        "- Improved error handling",
        "- Added input validation",
      ][i] ?? `paragraph ${i + 1}`;
    default:
      return [
        `/* ${name} — updated */`,
        ".container {",
        "  display: flex;",
        "  gap: 1rem;",
        "}",
      ][i] ?? `/* line ${i + 1} */`;
  }
}

export function FileDiffView() {
  const selectedFileId = useWorkspace((s) => s.selectedFileId);
  const setSelectedFile = useWorkspace((s) => s.setSelectedFile);
  const detail = useWorkspace((s) => s.detail);

  if (!selectedFileId) return null;

  // Try hand-written diffs first, then fall back to a generated diff
  let diff: FileDiff | undefined = fileDiffs[selectedFileId];
  if (!diff && detail) {
    const fc = detail.fileChanges.find((f) => f.id === selectedFileId);
    if (fc) diff = buildFallbackDiff(fc);
  }
  if (!diff) return null;

  const Icon = iconForLanguage[diff.language] ?? FileText;

  return (
    <aside className="flex h-full w-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <header className="flex items-center gap-2 border-b border-border px-4 pt-4 pb-3">
        <button
          onClick={() => setSelectedFile(null)}
          aria-label="Back to git tools"
          className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          File diff
        </span>
      </header>

      {/* File title + stat */}
      <div className="flex items-center justify-between gap-2 px-4 py-2.5">
        <FilePill name={diff.name} color={fileLanguageColor(diff.language)} />
        <DiffBadge add={diff.diffAdd} del={diff.diffDel} />
      </div>

      {/* Diff body */}
      <div className="scrollbar-thin flex-1 overflow-auto px-2 pb-4">
        <div className="overflow-hidden rounded-md border border-border bg-background/50 font-mono text-[11px] leading-relaxed">
          <table className="w-full border-collapse">
            <tbody>
              {diff.lines.map((line, i) => (
                <DiffRow key={i} line={line} />
              ))}
            </tbody>
          </table>
        </div>

        {diff.hiddenLines > 0 && (
          <p className="mt-2 px-1 text-[10px] text-muted-foreground">
            … {diff.hiddenLines} more {diff.hiddenLines === 1 ? "line" : "lines"}{" "}
            in this file not shown.
          </p>
        )}
      </div>
    </aside>
  );
}

function DiffRow({ line }: { line: DiffLine }) {
  if (line.type === "hunk") {
    return (
      <tr className="bg-primary/5">
        <td colSpan={3} className="px-2 py-1 text-[10px] text-primary/80">
          {line.content}
        </td>
      </tr>
    );
  }

  const sign =
    line.type === "add" ? "+" : line.type === "del" ? "-" : " ";
  const rowBg =
    line.type === "add"
      ? "bg-diff-add"
      : line.type === "del"
        ? "bg-diff-del"
        : "";
  const signColor =
    line.type === "add"
      ? "text-diff-add"
      : line.type === "del"
        ? "text-diff-del"
        : "text-muted-foreground/50";

  return (
    <tr className={cn("group", rowBg)}>
      <td className="w-8 select-none whitespace-nowrap px-1 text-right align-top text-muted-foreground/40 tabular-nums">
        {line.oldNo ?? ""}
      </td>
      <td className="w-8 select-none whitespace-nowrap px-1 text-right align-top text-muted-foreground/40 tabular-nums">
        {line.newNo ?? ""}
      </td>
      <td className="whitespace-pre-wrap break-words px-1 align-top">
        <span className={cn("mr-1 select-none", signColor)}>{sign}</span>
        <span
          className={cn(
            line.type === "add"
              ? "text-foreground"
              : line.type === "del"
                ? "text-foreground/80"
                : "text-foreground/70",
          )}
        >
          {line.content || " "}
        </span>
      </td>
    </tr>
  );
}
