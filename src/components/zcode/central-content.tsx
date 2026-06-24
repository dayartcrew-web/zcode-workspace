"use client";

import { useEffect, useRef, useState } from "react";
import {
  MoreHorizontal,
  Maximize2,
  Minimize2,
  Minus,
  Terminal,
  Pencil,
  ArrowUp,
  Plus,
  ChevronDown,
  Settings2,
  Sparkles,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/lib/store";
import { FilePill, DiffBadge } from "./file-pill";
import type { WorkspaceMessage } from "@/lib/types";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function CentralContent() {
  const detail = useWorkspace((s) => s.detail);
  const detailLoading = useWorkspace((s) => s.detailLoading);

  if (detailLoading || !detail) {
    return (
      <section className="flex h-full flex-col bg-background">
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading task…
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-full flex-col bg-background">
      <TaskHeader />
      <MessageList />
      <Composer />
    </section>
  );
}

/* ----------------------------- Task header ----------------------------- */

function TaskHeader() {
  const detail = useWorkspace((s) => s.detail)!;

  return (
    <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-3.5">
      <div className="flex min-w-0 flex-col gap-2">
        <h2
          className="truncate text-sm font-semibold text-foreground"
          title={detail.title}
        >
          {detail.title}
        </h2>
        <div className="flex flex-wrap items-center gap-1.5">
          {detail.tags.map((tag) => (
            <TagPill key={tag} label={tag} />
          ))}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1 text-muted-foreground">
        <IconButton label="More">
          <MoreHorizontal className="h-4 w-4" />
        </IconButton>
        <IconButton label="Minimize">
          <Minus className="h-4 w-4" />
        </IconButton>
        <IconButton label="Maximize">
          <Maximize2 className="h-4 w-4" />
        </IconButton>
        <IconButton label="Fullscreen">
          <Minimize2 className="h-4 w-4" />
        </IconButton>
      </div>
    </header>
  );
}

function TagPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      {label}
    </span>
  );
}

function IconButton({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      aria-label={label}
      className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
    >
      {children}
    </button>
  );
}

/* ----------------------------- Message list ----------------------------- */

function MessageList() {
  const detail = useWorkspace((s) => s.detail)!;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [detail.messages.length, detail.id]);

  return (
    <div
      ref={scrollRef}
      className="scrollbar-thin flex-1 overflow-y-auto px-5 py-5"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-5">
        {detail.messages.map((m) => (
          <MessageItem key={m.id} message={m} />
        ))}
        <FileChangesBlock />
        <GoalCompleteBanner />
      </div>
    </div>
  );
}

function MessageItem({ message }: { message: WorkspaceMessage }) {
  switch (message.kind) {
    case "command":
      return <CommandMessage message={message} />;
    case "file-update":
      return <FileUpdateMessage message={message} />;
    case "description":
    case "text":
    default:
      return <TextMessage message={message} />;
  }
}

function CommandMessage({ message }: { message: WorkspaceMessage }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/60 px-2 py-1 font-mono text-[11px] text-foreground/80">
          <Terminal className="h-3 w-3 text-primary" />
          {message.command}
        </span>
        <CheckCircle2 className="h-3.5 w-3.5 text-diff-add" />
      </div>
      <p className="text-sm leading-relaxed text-foreground/90">
        {message.content}
      </p>
    </div>
  );
}

function FileUpdateMessage({ message }: { message: WorkspaceMessage }) {
  const detail = useWorkspace((s) => s.detail)!;
  const setSelectedFile = useWorkspace((s) => s.setSelectedFile);
  const selectedFileId = useWorkspace((s) => s.selectedFileId);

  // Resolve each pill's file name to a change id so it can open the diff
  const byName = new Map(detail.fileChanges.map((f) => [f.name, f.id]));

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-foreground/90">
      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="font-medium">{message.content}</span>
      {message.files?.map((f) => {
        const fileId = byName.get(f.name);
        const clickable = Boolean(fileId);
        const active = fileId != null && selectedFileId === fileId;
        return (
          <FilePill
            key={f.name}
            name={f.name}
            color={f.color}
            active={active}
            title={clickable ? `View diff for ${f.name}` : undefined}
            onClick={
              clickable
                ? () => setSelectedFile(fileId!)
                : undefined
            }
          />
        );
      })}
      {message.diffAdd + message.diffDel > 0 && (
        <DiffBadge add={message.diffAdd} del={message.diffDel} />
      )}
    </div>
  );
}

function TextMessage({ message }: { message: WorkspaceMessage }) {
  return (
    <p className="text-sm leading-relaxed text-foreground/90">
      {message.content}
    </p>
  );
}

/* --------------------------- File changes block --------------------------- */

function FileChangesBlock() {
  const detail = useWorkspace((s) => s.detail)!;
  const setSelectedFile = useWorkspace((s) => s.setSelectedFile);
  const setRightPanelView = useWorkspace((s) => s.setRightPanelView);
  const selectedFileId = useWorkspace((s) => s.selectedFileId);
  const [collapsed, setCollapsed] = useState(false);
  if (detail.fileChanges.length === 0) return null;

  const totalAdd = detail.fileChanges.reduce((s, f) => s + f.diffAdd, 0);
  const totalDel = detail.fileChanges.reduce((s, f) => s + f.diffDel, 0);

  return (
    <div className="rounded-lg border border-border bg-card/60 p-3">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
        aria-controls="file-changes-list"
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform",
              collapsed && "-rotate-90",
            )}
          />
          Changes
          <span className="ml-1 text-[10px] font-normal normal-case tracking-normal text-muted-foreground/70">
            ({detail.fileChanges.length})
          </span>
        </span>
        <DiffBadge add={totalAdd} del={totalDel} />
      </button>
      {!collapsed && (
        <ul id="file-changes-list" className="mt-2 space-y-1">
          {detail.fileChanges.map((f) => {
            const isActive = selectedFileId === f.id;
            return (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(f.id);
                    setRightPanelView("diff");
                  }}
                  aria-pressed={isActive}
                  title={`View diff for ${f.name}`}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors",
                    isActive
                      ? "bg-accent text-foreground"
                      : "hover:bg-accent/40",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <FilePill name={f.name} color={colorForLanguage(f.language)} />
                  </span>
                  <DiffBadge add={f.diffAdd} del={f.diffDel} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-2 px-1 text-[10px] text-muted-foreground/70">
        Click a file to view its diff in the side panel.
      </p>
    </div>
  );
}

function colorForLanguage(lang: string) {
  switch (lang.toLowerCase()) {
    case "css":
      return "purple" as const;
    case "html":
      return "orange" as const;
    case "javascript":
    case "js":
      return "yellow" as const;
    case "typescript":
    case "ts":
      return "blue" as const;
    case "markdown":
    case "md":
      return "blue" as const;
    default:
      return "purple" as const;
  }
}

function GoalCompleteBanner() {
  const detail = useWorkspace((s) => s.detail)!;
  const complete =
    detail.checklist.length > 0 &&
    detail.checklist.every((c) => c.done);
  if (!complete) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-diff-add/30 bg-diff-add/10 px-3 py-2 text-sm text-foreground/90">
      <CheckCircle2 className="h-4 w-4 text-diff-add" />
      All {detail.checklist.length} steps complete. Ready to commit &amp; push.
    </div>
  );
}

/* ------------------------------- Composer ------------------------------- */

function Composer() {
  const detail = useWorkspace((s) => s.detail)!;
  const composerValue = useWorkspace((s) => s.composerValue);
  const setComposerValue = useWorkspace((s) => s.setComposerValue);
  const model = useWorkspace((s) => s.model);
  const effort = useWorkspace((s) => s.effort);
  const isSending = useWorkspace((s) => s.isSending);
  const setSending = useWorkspace((s) => s.setSending);
  const appendMessage = useWorkspace((s) => s.appendMessage);
  const language = useWorkspace((s) => s.language);

  const taRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "0px";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }, [composerValue]);

  async function handleSend() {
    const prompt = composerValue.trim();
    if (!prompt || isSending) return;

    // Push the user's message immediately
    appendMessage({
      id: `u-${Date.now()}`,
      taskId: detail.id,
      role: "user",
      kind: "text",
      content: prompt,
      diffAdd: 0,
      diffDel: 0,
      createdAt: new Date().toISOString(),
    });

    setComposerValue("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          taskTitle: detail.title,
          taskGoal: detail.goal,
          branch: detail.branch,
          model,
          effort,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as {
        content: string;
        command?: string;
        diffAdd: number;
        diffDel: number;
        files?: { name: string; color: "blue" | "purple" | "orange" }[];
      };

      appendMessage({
        id: `a-${Date.now()}`,
        taskId: detail.id,
        role: "assistant",
        kind: "command",
        content: data.content,
        command: data.command ?? "Ran plan",
        diffAdd: 0,
        diffDel: 0,
        createdAt: new Date().toISOString(),
      });

      if (data.files && data.files.length > 0) {
        appendMessage({
          id: `a-f-${Date.now()}`,
          taskId: detail.id,
          role: "assistant",
          kind: "file-update",
          content: "Updated",
          files: data.files,
          diffAdd: data.diffAdd,
          diffDel: data.diffDel,
          createdAt: new Date().toISOString(),
        });
      }

      toast.success(language === "zh" ? "已应用变更" : "Changes applied", {
        description: `+${data.diffAdd} -${data.diffDel}`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error("Failed to get response", { description: msg });
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  const placeholder =
    language === "zh"
      ? "向 ZCode 提问，@ 添加文件，/ 调用命令，$ 使用技能，# 关联会话"
      : "Ask ZCode anything, @ to add files, / for commands, $ for skills, # related conversation";

  return (
    <div className="border-t border-border px-5 py-3">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-xl border border-border bg-card/60 focus-within:border-primary/50 focus-within:bg-card">
          {/* Textarea row */}
          <textarea
            ref={taRef}
            value={composerValue}
            onChange={(e) => setComposerValue(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            rows={1}
            className="scrollbar-thin block w-full resize-none bg-transparent px-3.5 pt-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {/* Controls row: [+] menu on left, model + send on right */}
          <div className="flex items-center justify-between gap-2 px-2.5 pb-2 pt-1.5">
            <div className="flex items-center gap-1">
              <PlusMenu />
            </div>

            <div className="flex items-center gap-2">
              <ModelMenu />
              <button
                onClick={handleSend}
                disabled={!composerValue.trim() || isSending}
                aria-label="Send"
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-lg transition-colors",
                  composerValue.trim() && !isSending
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUp className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
        <p className="mt-1.5 px-1 text-[10px] text-muted-foreground">
          {language === "zh"
            ? "ZCode 可能会犯错。请审查变更。"
            : "ZCode can make mistakes. Review changes before committing."}
        </p>
      </div>
    </div>
  );
}

const MODELS = [
  { id: "GLM-5.2", label: "GLM-5.2", hint: "Default · fastest" },
  { id: "GLM-4.6", label: "GLM-4.6", hint: "Balanced" },
  { id: "Claude Sonnet 4.6", label: "Claude Sonnet 4.6", hint: "Anthropic" },
  { id: "GPT-5.4", label: "GPT-5.4", hint: "OpenAI" },
  { id: "GPT-5.4-Mini", label: "GPT-5.4-Mini", hint: "OpenAI · cheap" },
];

const EFFORTS: { id: "low" | "medium" | "high" | "max"; label: string; hint: string }[] = [
  { id: "low", label: "Low", hint: "1 step · quickest" },
  { id: "medium", label: "Medium", hint: "~3 steps" },
  { id: "high", label: "High", hint: "~5 steps" },
  { id: "max", label: "Max", hint: "Full plan · slowest" },
];

function PlusMenu() {
  const askBeforeChanges = useWorkspace((s) => s.askBeforeChanges);
  const toggleAskBeforeChanges = useWorkspace((s) => s.toggleAskBeforeChanges);
  const effort = useWorkspace((s) => s.effort);
  const setEffort = useWorkspace((s) => s.setEffort);

  const effortLabel =
    effort === "max" ? "Max" : effort[0].toUpperCase() + effort.slice(1);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Add attachment or tools"
          className="grid h-7 w-7 place-items-center rounded-md border border-transparent text-muted-foreground hover:bg-accent/60 hover:text-foreground"
        >
          <Plus className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-64">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Add to conversation
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => toast.info("Attach file", { description: "Choose files to reference." })}
          className="gap-2 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Attach file
          <span className="ml-auto text-[10px] text-muted-foreground">@</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => toast.info("Slash command", { description: "Type / in the box." })}
          className="gap-2 text-xs"
        >
          <Terminal className="h-3.5 w-3.5" />
          Run command
          <span className="ml-auto text-[10px] text-muted-foreground">/</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => toast.info("Skill", { description: "Type $ in the box." })}
          className="gap-2 text-xs"
        >
          <Settings2 className="h-3.5 w-3.5" />
          Use skill
          <span className="ml-auto text-[10px] text-muted-foreground">$</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* Change mode */}
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Change mode
        </DropdownMenuLabel>
        <DropdownMenuItem
          onSelect={() => {
            if (askBeforeChanges) toggleAskBeforeChanges();
          }}
          className="gap-2 text-xs"
        >
          <div className="flex flex-1 flex-col">
            <span className="font-medium">Auto-apply</span>
            <span className="text-[10px] text-muted-foreground">
              Apply edits without asking
            </span>
          </div>
          {!askBeforeChanges && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            if (!askBeforeChanges) toggleAskBeforeChanges();
          }}
          className="gap-2 text-xs"
        >
          <div className="flex flex-1 flex-col">
            <span className="font-medium">Ask before changes</span>
            <span className="text-[10px] text-muted-foreground">
              Confirm each edit before it&apos;s applied
            </span>
          </div>
          {askBeforeChanges && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* Effort */}
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Effort
          <span className="ml-1.5 font-normal normal-case tracking-normal text-foreground/70">
            {effortLabel}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={effort}
          onValueChange={(v) =>
            setEffort(v as "low" | "medium" | "high" | "max")
          }
        >
          {EFFORTS.map((e) => (
            <DropdownMenuRadioItem
              key={e.id}
              value={e.id}
              className="gap-2 py-1.5"
            >
              <span className="flex flex-1 items-center gap-1.5 text-xs font-medium">
                {e.id === "max" && <Sparkles className="h-3 w-3 text-primary" />}
                {e.label}
                <span className="ml-auto text-[10px] font-normal text-muted-foreground">
                  {e.hint}
                </span>
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ModelMenu() {
  const model = useWorkspace((s) => s.model);
  const setModel = useWorkspace((s) => s.setModel);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex h-7 items-center gap-1 rounded-md border border-transparent px-2 text-[11px] font-medium text-muted-foreground hover:bg-accent/60 hover:text-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          {model}
          <ChevronDown className="h-3 w-3 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="end" className="w-60">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Model
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={model}
          onValueChange={(v) => setModel(v)}
        >
          {MODELS.map((m) => (
            <DropdownMenuRadioItem
              key={m.id}
              value={m.id}
              className="gap-2 py-1.5"
            >
              <span className="flex flex-1 flex-col">
                <span className="text-xs font-medium">{m.label}</span>
                <span className="text-[10px] text-muted-foreground">
                  {m.hint}
                </span>
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
