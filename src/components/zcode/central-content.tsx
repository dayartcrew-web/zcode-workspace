"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Brain,
  User,
  Bot,
  Cpu,
  ClipboardList,
  Pin,
  Archive,
  Mail,
  FolderOpen,
  Copy,
  Settings,
  LineChart,
  Flag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/lib/store";
import type { ComposerMode } from "@/lib/features/composer/slice";
import { FilePill, DiffBadge } from "./file-pill";
import { useSimulationApi } from "./simulation-provider";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatTokens } from "@/lib/format";

/* --------------------------- animation helpers --------------------------- */

const MESSAGE_ENTER = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.28, ease: "easeOut" as const },
};

/** Smoothly animate a number toward a target whenever it changes. */
function useCountUp(target: number, duration = 0.6) {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000));
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

/** Resolve true once streaming finishes, or false after `timeoutMs`. */
function waitForStreamingEnd(timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    // Give the server a moment to emit sim:chat-start before checking.
    const startedAt = Date.now();
    const check = () => {
      const state = useWorkspace.getState();
      if (!state.streamingMessageId) {
        resolve(true);
        return;
      }
      if (Date.now() - startedAt >= timeoutMs) {
        resolve(false);
        return;
      }
      setTimeout(check, 250);
    };
    setTimeout(check, 300);
  });
}

/** Assistant avatar badge — spinning brain while thinking, bot icon when done. */
function AssistantAvatar({ thinking }: { thinking: boolean }) {
  return (
    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/20">
      {thinking ? (
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
          className="inline-flex"
        >
          <Brain className="h-4 w-4" />
        </motion.span>
      ) : (
        <Bot className="h-4 w-4" />
      )}
    </div>
  );
}

/** "Thinking…" indicator shown while the assistant has started but emitted no tokens yet. */
function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-2 py-0.5 text-sm text-muted-foreground">
      <motion.span
        animate={{ rotate: 360 }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
        className="inline-flex text-primary"
      >
        <Brain className="h-4 w-4" />
      </motion.span>
      <span className="font-medium">Thinking</span>
      <span className="flex items-center gap-0.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1 w-1 rounded-full bg-muted-foreground/70"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.18,
              ease: "easeInOut",
            }}
          />
        ))}
      </span>
    </div>
  );
}

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
        <MoreMenu />
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
    <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 px-2 py-0.5 text-xs font-medium text-muted-foreground">
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

/* "More" task actions dropdown — mirrors the reference image list. */
function MoreMenu() {
  const detail = useWorkspace((s) => s.detail)!;
  const taskPath = `~/projects/${detail.project}/${detail.id}`;
  const logPath = `~/projects/${detail.project}/.zcode/logs/${detail.id}.log`;

  const copy = (label: string, value: string) => {
    void navigator.clipboard?.writeText(value);
    toast.success(`${label} copied`, {
      description: <span className="font-mono text-xs">{value}</span>,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="More"
          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end" className="w-60">
        {/* Task actions */}
        <DropdownMenuItem
          onSelect={() => toast.info("Pinned task", { description: detail.title })}
          className="gap-2 text-xs"
        >
          <Pin className="h-3.5 w-3.5" />
          Pin task
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => toast.info("Rename task", { description: "Enter a new title." })}
          className="gap-2 text-xs"
        >
          <Pencil className="h-3.5 w-3.5" />
          Rename task
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => toast.info("Archived task", { description: detail.title })}
          className="gap-2 text-xs"
        >
          <Archive className="h-3.5 w-3.5" />
          Archive task
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => toast.info("Marked as unread", { description: detail.title })}
          className="gap-2 text-xs"
        >
          <Mail className="h-3.5 w-3.5" />
          Mark as unread
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Filesystem */}
        <DropdownMenuItem
          onSelect={() => toast.info("Open in File Explorer", { description: taskPath })}
          className="gap-2 text-xs"
        >
          <FolderOpen className="h-3.5 w-3.5" />
          Open in File Explorer
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => copy("Path", `./${detail.branch}`)}
          className="gap-2 text-xs"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy path
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => copy("Task path", taskPath)}
          className="gap-2 text-xs"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy task path
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => copy("Log path", logPath)}
          className="gap-2 text-xs"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy log path
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => copy("Session ID", detail.id)}
          className="gap-2 text-xs"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy session ID
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Diagnostics */}
        <DropdownMenuItem
          onSelect={() => toast.info("Go to config", { description: "Opening .zcode/settings.json" })}
          className="gap-2 text-xs"
        >
          <Settings className="h-3.5 w-3.5" />
          Go to config
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => toast.info("Model trajectory", { description: `Model: ${detail.model} · ${detail.tokensUsed.toLocaleString()} tokens` })}
          className="gap-2 text-xs"
        >
          <LineChart className="h-3.5 w-3.5" />
          View model trajectory
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => toast.info("Report issue", { description: "Opens the issue template." })}
          className="gap-2 text-xs"
        >
          <Flag className="h-3.5 w-3.5" />
          Report issue
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ----------------------------- Message list ----------------------------- */

function MessageList() {
  const detail = useWorkspace((s) => s.detail)!;
  const streamingMessageId = useWorkspace((s) => s.streamingMessageId);
  const streamingContent = useWorkspace((s) => s.streamingContent);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [detail.messages.length, detail.id, streamingContent]);

  return (
    <div
      ref={scrollRef}
      className="scrollbar-thin flex-1 overflow-y-auto px-5 py-5"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-5">
        {detail.messages.map((m) => (
          <MessageItem key={m.id} message={m} />
        ))}
        <AnimatePresence>
          {streamingMessageId && (
            <motion.div
              key={`streaming-${streamingMessageId}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex gap-3"
            >
              <AssistantAvatar thinking={!streamingContent.trim()} />
              <div className="flex min-w-0 flex-1 flex-col gap-1 rounded-lg border border-border/60 bg-card/40 px-3.5 py-2.5">
                <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  ZCode
                </div>
                {streamingContent.trim() ? (
                  <p className="text-sm leading-relaxed text-foreground/90">
                    {streamingContent}
                    <span className="ml-0.5 inline-block h-3.5 w-0.5 translate-y-0.5 animate-pulse bg-primary/70" />
                  </p>
                ) : (
                  <ThinkingIndicator />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <FileChangesBlock />
        <GoalCompleteBanner />
      </div>
    </div>
  );
}

function MessageItem({ message }: { message: WorkspaceMessage }) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  // Pick avatar + label by role
  const avatar = isUser ? (
    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent text-foreground ring-1 ring-border">
      <User className="h-4 w-4" />
    </div>
  ) : isSystem ? (
    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground ring-1 ring-border">
      <Cpu className="h-4 w-4" />
    </div>
  ) : (
    <AssistantAvatar thinking={false} />
  );
  const label = isUser ? "You" : isSystem ? "System" : "ZCode";

  let body: React.ReactNode;
  switch (message.kind) {
    case "command":
      body = <CommandMessage message={message} />;
      break;
    case "file-update":
      body = <FileUpdateMessage message={message} />;
      break;
    case "description":
    case "text":
    default:
      body = <TextMessage message={message} />;
      break;
  }

  return (
    <motion.div {...MESSAGE_ENTER} layout="position" className="flex gap-3">
      {avatar}
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col gap-1.5 rounded-lg border px-3.5 py-2.5",
          isUser
            ? "border-primary/30 bg-primary/5"
            : "border-border/60 bg-card/40",
        )}
      >
        <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        {body}
      </div>
    </motion.div>
  );
}

function CommandMessage({ message }: { message: WorkspaceMessage }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="inline-flex w-fit items-center gap-1.5 rounded-md bg-muted/70 px-2 py-1 font-mono text-xs text-foreground/80 ring-1 ring-border/50">
        <Terminal className="h-3 w-3 text-primary" />
        {message.command}
        <CheckCircle2 className="ml-0.5 h-3 w-3 text-diff-add" />
      </div>
      {message.content && (
        <p className="text-sm leading-relaxed text-foreground/90">
          {message.content}
        </p>
      )}
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
      <span className="text-xs font-medium">{message.content}</span>
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
  const [collapsed, setCollapsed] = useState(true);
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
          <span className="ml-1 text-xs font-normal normal-case tracking-normal text-muted-foreground/70">
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
      <p className="mt-2 px-1 text-xs text-muted-foreground/70">
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
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex items-center gap-2 rounded-lg border border-diff-add/30 bg-diff-add/10 px-3 py-2 text-sm text-foreground/90"
    >
      <CheckCircle2 className="h-4 w-4 text-diff-add" />
      All {detail.checklist.length} steps complete. Ready to commit &amp; push.
    </motion.div>
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
  const sim = useSimulationApi();

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

    // If the live simulation sidecar is connected, stream the reply via ws.
    if (sim && sim.status === "connected") {
      try {
        sim.requestChat(detail.id, prompt);
        // The streaming bubble + tokens are driven by sim:chat-* events;
        // we keep the spinner until the stream ends. Bound the wait so a
        // sidecar that dies mid-stream can't hang the composer forever.
        const streamingDone = await waitForStreamingEnd(15000);
        if (!streamingDone) {
          // Timed out — clear any half-streamed state so the UI recovers.
          useWorkspace.getState().cancelStreaming();
          toast.error(language === "zh" ? "回复超时" : "Reply timed out", {
            description: language === "zh" ? "模拟服务无响应" : "The simulation sidecar didn't respond.",
          });
        }
      } finally {
        setSending(false);
      }
      return;
    }

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
          {/* Controls row: [+] + mode menu on left, model + send on right */}
          <div className="flex items-center justify-between gap-2 px-2.5 pb-2 pt-1.5">
            <div className="flex items-center gap-1.5">
              <PlusMenu />
              <ModeMenu />
            </div>

            <div className="flex items-center gap-2">
              <ModelMenu />
              <ContextWindowIndicator />
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
        <p className="mt-1.5 px-1 text-xs text-muted-foreground">
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

/* Mode selector dropup: Ask | Plan | Auto, surfaced in the composer bar.
   The current mode's label is always visible on the trigger. */
const COMPOSER_MODES: {
  id: ComposerMode;
  label: string;
  hint: string;
  Icon: typeof Pencil;
}[] = [
  {
    id: "ask",
    label: "Ask",
    hint: "Answer & discuss, no changes",
    Icon: Pencil,
  },
  {
    id: "plan",
    label: "Plan",
    hint: "Draft a plan before editing",
    Icon: ClipboardList,
  },
  {
    id: "auto",
    label: "Auto",
    hint: "Plan, edit & run autonomously",
    Icon: Sparkles,
  },
];

function ModeMenu() {
  const composerMode = useWorkspace((s) => s.composerMode);
  const setComposerMode = useWorkspace((s) => s.setComposerMode);
  const active =
    COMPOSER_MODES.find((m) => m.id === composerMode) ?? COMPOSER_MODES[0];
  if (!active) return null;
  const ActiveIcon = active.Icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={`Change mode (current: ${active.label})`}
          className="flex h-7 items-center gap-1.5 rounded-md border border-transparent px-2 text-xs font-medium text-foreground hover:bg-accent/60"
        >
          <ActiveIcon className="h-3.5 w-3.5 text-primary" />
          {active.label}
          <ChevronDown className="h-3 w-3 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-60">
        <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
          Mode
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={composerMode}
          onValueChange={(v) => setComposerMode(v as ComposerMode)}
        >
          {COMPOSER_MODES.map((m) => {
            const Icon = m.Icon;
            return (
              <DropdownMenuRadioItem
                key={m.id}
                value={m.id}
                className="gap-2 py-1.5"
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="flex flex-1 flex-col">
                  <span className="text-xs font-medium">{m.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {m.hint}
                  </span>
                </span>
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PlusMenu() {
  const effort = useWorkspace((s) => s.effort);
  const setEffort = useWorkspace((s) => s.setEffort);

  const effortLabel =
    effort === "max" ? "Max" : effort.charAt(0).toUpperCase() + effort.slice(1);

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
        <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
          Add to conversation
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => toast.info("Attach file", { description: "Choose files to reference." })}
          className="gap-2 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Attach file
          <span className="ml-auto text-xs text-muted-foreground">@</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => toast.info("Slash command", { description: "Type / in the box." })}
          className="gap-2 text-xs"
        >
          <Terminal className="h-3.5 w-3.5" />
          Run command
          <span className="ml-auto text-xs text-muted-foreground">/</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => toast.info("Skill", { description: "Type $ in the box." })}
          className="gap-2 text-xs"
        >
          <Settings2 className="h-3.5 w-3.5" />
          Use skill
          <span className="ml-auto text-xs text-muted-foreground">$</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* Effort */}
        <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
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
                <span className="ml-auto text-xs font-normal text-muted-foreground">
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

/* Context-window indicator: a small donut ring showing token usage, with a
   detailed hover popover that breaks down context categories, cache, quota
   and rate-limit usage. */
const CONTEXT_LIMIT = 200_000; // tokens — typical model context window

/** One row in the category breakdown, with a mini bar. */
function ContextRow({
  label,
  pct,
  colorClass,
}: {
  label: string;
  pct: number;
  colorClass: string;
}) {
  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className="w-24 shrink-0 truncate text-xs text-muted-foreground">
        {label}
      </span>
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full bg-current", colorClass)}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      <span className="w-8 shrink-0 text-right text-xs tabular-nums text-foreground/70">
        {pct.toFixed(1)}%
      </span>
    </div>
  );
}

function ContextWindowIndicator() {
  const detail = useWorkspace((s) => s.detail)!;
  const used = detail.tokensUsed;
  const pct = Math.min(100, (used / CONTEXT_LIMIT) * 100);
  const pctRounded = Math.round(pct);
  const remaining = Math.max(0, CONTEXT_LIMIT - used);

  // Donut geometry: r=6 in a 16x16 viewBox → circumference ≈ 37.70
  const r = 6;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  // Color shifts with usage: blue → amber → red
  const color =
    pct >= 90 ? "text-destructive" : pct >= 70 ? "text-amber-500" : "text-primary";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label={`Context window ${pctRounded}% used`}
          title={`Context: ${pctRounded}%`}
          className="flex h-6 w-6 items-center justify-center rounded-md border border-transparent text-muted-foreground hover:bg-accent/60 hover:text-foreground"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4 -rotate-90" fill="none">
            <circle cx="8" cy="8" r={r} strokeWidth="2" className="stroke-current opacity-30" />
            <circle
              cx="8"
              cy="8"
              r={r}
              strokeWidth="2"
              strokeLinecap="round"
              className={cn(color, "transition-[stroke-dasharray] duration-500")}
              style={{ strokeDasharray: `${dash} ${circ - dash}` }}
            />
          </svg>
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" align="center" className="w-72 p-3 text-xs">
        {/* Header: total usage */}
        <div className="mb-2.5 flex items-baseline justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Context windows
          </span>
          <span className="tabular-nums text-foreground/80">
            {formatTokens(used)}/200K{" "}
            <span className={cn("font-semibold", color)}>({pct.toFixed(1)}%)</span>
          </span>
        </div>

        {/* Category breakdown */}
        <div className="space-y-0">
          <ContextRow label="Messages" pct={87.7} colorClass="text-primary" />
          <ContextRow label="MCP tools" pct={7.4} colorClass="text-sky-500" />
          <ContextRow label="System tools" pct={3.5} colorClass="text-violet-500" />
          <ContextRow label="Skills" pct={1.2} colorClass="text-emerald-500" />
          <ContextRow label="System prompt" pct={0.2} colorClass="text-amber-500" />
          <ContextRow label="Meta context" pct={0} colorClass="text-muted-foreground" />
        </div>

        <div className="my-2.5 h-px bg-border" />

        {/* Cache + quota */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          <div>
            <div className="text-xs text-muted-foreground">Average cache hit rate</div>
            <div className="text-xs font-medium text-foreground">80.1%</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Usage remaining</div>
            <div className="text-xs font-medium text-emerald-500">150% Quota</div>
          </div>
        </div>

        <div className="my-2.5 h-px bg-border" />

        {/* Rate limit / window */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">More</span>
            <span className="text-xs tabular-nums text-foreground/80">5 hours</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Window</span>
            <span className="text-xs tabular-nums text-foreground/80">
              15% · 01:29
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Tool calls</span>
            <span className="text-xs tabular-nums text-foreground/80">
              56% · Jun 26
            </span>
          </div>
        </div>

        <div className="my-2.5 h-px bg-border" />

        {/* Footer: remaining tokens */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Tokens remaining</span>
          <span className="text-xs font-medium tabular-nums text-foreground">
            {formatTokens(remaining)}
          </span>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ModelMenu() {
  const model = useWorkspace((s) => s.model);
  const setModel = useWorkspace((s) => s.setModel);
  const active = MODELS.find((m) => m.id === model) ?? MODELS[0];
  if (!active) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex h-7 items-center gap-1.5 rounded-md border border-transparent px-2 text-xs font-medium text-foreground hover:bg-accent/60">
          <Cpu className="h-3.5 w-3.5 text-primary" />
          <span className="max-w-[8.5rem] truncate">{active.label}</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="end" className="w-60">
        <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
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
                <span className="flex items-center gap-1.5 text-xs font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {m.label}
                </span>
                <span className="pl-3 text-xs text-muted-foreground">
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
