"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  GitBranch,
  GitCommitVertical,
  Target,
  CheckCircle2,
  Circle,
  Flag,
  Clock,
  Cpu,
  ListChecks,
  ChevronDown,
  Plus,
  RefreshCw,
  Check,
  MoreHorizontal,
  Minus,
  Maximize2,
  X,
  FolderTree,
  GitCompare,
  Wrench,
  Upload as UploadIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/lib/store";
import { DiffBadge } from "./file-pill";
import { formatTokens } from "@/lib/format";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FileDiffView } from "./file-diff-view";
import { FileTreePanel } from "./file-tree-panel";

export function RightSidebar() {
  const detail = useWorkspace((s) => s.detail);
  const selectedFileId = useWorkspace((s) => s.selectedFileId);
  const rightPanelView = useWorkspace((s) => s.rightPanelView);
  const setRightPanelView = useWorkspace((s) => s.setRightPanelView);
  const setSelectedFile = useWorkspace((s) => s.setSelectedFile);
  const toggleMaximized = useWorkspace((s) => s.toggleCenterMaximized);
  const maximized = useWorkspace((s) => s.centerMaximized);
  const deleteTask = useWorkspace((s) => s.deleteTask);

  // When a file is selected for diff, show the diff view regardless of tab
  if (detail && selectedFileId) return <FileDiffView />;
  if (!detail) return null;

  return (
    <aside className="flex h-full w-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Panel header: view-toggle icons + window controls + refresh */}
      <header className="flex items-center gap-1 border-b border-border px-2 py-2">
        {/* View toggle icons */}
        <ViewToggle
          icon={<FolderTree className="h-4 w-4" />}
          label="File tree"
          active={rightPanelView === "tree"}
          onClick={() => setRightPanelView("tree")}
        />
        <ViewToggle
          icon={<GitCompare className="h-4 w-4" />}
          label="Git diff"
          active={rightPanelView === "diff"}
          onClick={() => {
            setRightPanelView("diff");
            // pick the first file change if any
            if (detail.fileChanges[0]) setSelectedFile(detail.fileChanges[0].id);
          }}
        />
        <ViewToggle
          icon={<Wrench className="h-4 w-4" />}
          label="Git tools"
          active={rightPanelView === "git-tools"}
          onClick={() => setRightPanelView("git-tools")}
        />

        <div className="mx-1 h-4 w-px shrink-0 bg-border" />

        {/* Window controls */}
        <div className="ml-auto flex shrink-0 items-center gap-0.5">
          <button
            aria-label="More"
            onClick={() => toast.info("Panel options", { description: "More actions." })}
            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
          <button
            aria-label="Minimize"
            onClick={() => toast.info("Minimize panel", { description: "Collapse this panel." })}
            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button
            aria-label={maximized ? "Exit maximize" : "Maximize"}
            onClick={toggleMaximized}
            className={cn(
              "rounded p-1",
              maximized
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
          <button
            aria-label="Close"
            onClick={() => deleteTask(detail.id)}
            className="rounded p-1 text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* Body depends on active view */}
      {rightPanelView === "tree" ? (
        <FileTreePanel />
      ) : rightPanelView === "diff" ? (
        <DiffPlaceholder />
      ) : (
        <div className="scrollbar-thin flex-1 overflow-y-auto px-3 pb-4 pt-4">
          <div className="flex flex-col gap-3">
            <ChangesCard />
            <CommitCard key={`${detail.id}-${detail.branch}`} />
            <GoalCard />
            <ProgressCard />
            <UploadCard />
          </div>
        </div>
      )}
    </aside>
  );
}

/* --------------------------- View toggle button --------------------------- */

function ViewToggle({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "rounded-md p-1.5 transition-colors",
        active
          ? "bg-accent text-foreground"
          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
      )}
    >
      {icon}
    </button>
  );
}

/* --------------------------- Diff placeholder --------------------------- */

function DiffPlaceholder() {
  const detail = useWorkspace((s) => s.detail)!;
  if (detail.fileChanges.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 text-center text-xs text-muted-foreground">
        No file changes to diff.
      </div>
    );
  }
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
      <GitCompare className="mb-2 h-8 w-8 text-muted-foreground/50" />
      <p className="text-xs text-muted-foreground">
        Select a file from the Changes card to view its diff.
      </p>
    </div>
  );
}

function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card/50 p-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

function CardHeader({
  icon,
  title,
  right,
}: {
  icon: React.ReactNode;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {icon}
        {title}
      </div>
      {right}
    </div>
  );
}

function ChangesCard() {
  const detail = useWorkspace((s) => s.detail)!;
  const totalAdd = detail.fileChanges.reduce((s, f) => s + f.diffAdd, 0);
  const totalDel = detail.fileChanges.reduce((s, f) => s + f.diffDel, 0);

  return (
    <Card>
      <CardHeader
        icon={<GitBranch className="h-3.5 w-3.5" />}
        title="Changes"
        right={<DiffBadge add={totalAdd} del={totalDel} />}
      />
      <BranchSelect />
      <p className="mt-2 px-1 text-[10px] text-muted-foreground">
        {detail.fileChanges.length} files changed
      </p>
    </Card>
  );
}

/* --------------------------- Branch dropdown --------------------------- */

function BranchSelect() {
  const detail = useWorkspace((s) => s.detail)!;
  const branches = useWorkspace((s) => s.branches);
  const setBranch = useWorkspace((s) => s.setBranch);
  const [newBranchOpen, setNewBranchOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex w-full items-center gap-1.5 rounded-md bg-muted/40 px-2 py-1.5 text-xs text-foreground/90 hover:bg-muted/70 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50">
            <GitBranch className="h-3 w-3 text-primary" />
            <span className="truncate font-mono">{detail.branch}</span>
            <ChevronDown className="ml-auto h-3 w-3 opacity-60" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[14rem]"
        >
          <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Switch branch
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={detail.branch}
            onValueChange={(v) => {
              setBranch(v);
              toast.success(`Switched to ${v}`);
            }}
          >
            <div className="max-h-60 overflow-y-auto">
              {branches.map((b) => (
                <DropdownMenuRadioItem
                  key={b}
                  value={b}
                  className="gap-2 font-mono text-xs"
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    <GitBranch className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <span className="truncate">{b}</span>
                  </span>
                </DropdownMenuRadioItem>
              ))}
            </div>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => setNewBranchOpen(true)}
            className="gap-2 text-xs text-foreground/90"
          >
            <Plus className="h-3.5 w-3.5 text-primary" />
            New branch…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <NewBranchDialog open={newBranchOpen} onOpenChange={setNewBranchOpen} />
    </>
  );
}

function NewBranchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const detail = useWorkspace((s) => s.detail)!;
  const createBranch = useWorkspace((s) => s.createBranch);
  const [name, setName] = useState("feat/");

  function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Branch name cannot be empty");
      return;
    }
    createBranch(trimmed);
    toast.success(`Created and switched to ${trimmed}`);
    setName("feat/");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            <Plus className="h-4 w-4 text-primary" />
            Create new branch
          </DialogTitle>
          <DialogDescription className="text-xs">
            Branch off{" "}
            <span className="font-mono text-foreground/80">
              {detail.branch}
            </span>{" "}
            and switch to it for this task.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <label
            htmlFor="branch-name"
            className="text-xs font-medium text-muted-foreground"
          >
            Branch name
          </label>
          <Input
            id="branch-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreate();
              }
            }}
            placeholder="feat/my-new-branch"
            className="font-mono text-sm"
            autoFocus
          />
          <p className="text-[11px] text-muted-foreground">
            Use a prefix like <span className="font-mono">feat/</span>,{" "}
            <span className="font-mono">fix/</span>, or{" "}
            <span className="font-mono">chore/</span>.
          </p>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 text-xs"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleCreate}
            className="h-8 gap-1.5 text-xs"
          >
            <Check className="h-3.5 w-3.5" />
            Create branch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CommitCard() {
  const detail = useWorkspace((s) => s.detail)!;
  const [msg, setMsg] = useState(() =>
    `feat(${detail.branch.split("/").pop()}): ${shortTitle(detail.goal)}`,
  );

  const complete =
    detail.checklist.length > 0 && detail.checklist.every((c) => c.done);

  return (
    <Card>
      <CardHeader
        icon={<GitCommitVertical className="h-3.5 w-3.5" />}
        title="Commit"
      />
      <textarea
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        placeholder="Commit message…"
        rows={2}
        className="scrollbar-thin w-full resize-none rounded-md border border-border bg-background/60 px-2.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
      />
      <div className="mt-2 flex items-center gap-1.5">
        <Button
          size="sm"
          className="h-7 flex-1 gap-1.5 bg-primary text-xs font-medium text-primary-foreground hover:bg-primary/90"
          disabled={!complete}
        >
          <Plus className="h-3 w-3" />
          {complete ? "Commit & push" : "Complete task first"}
        </Button>
      </div>
    </Card>
  );
}

function shortTitle(s: string) {
  const t = s.trim().split(/\s+/).slice(0, 6).join(" ");
  return t.length > 48 ? t.slice(0, 48) + "…" : t;
}

function GoalCard() {
  const detail = useWorkspace((s) => s.detail)!;
  const complete =
    detail.checklist.length > 0 && detail.checklist.every((c) => c.done);
  const pct =
    detail.totalSteps > 0
      ? Math.round((detail.stepCount / detail.totalSteps) * 100)
      : 0;

  return (
    <Card>
      <CardHeader
        icon={<Target className="h-3.5 w-3.5" />}
        title="Goal"
        right={
          <span className="text-[10px] text-muted-foreground">
            {complete ? "Complete" : "In progress"}
          </span>
        }
      />
      <p className="text-sm leading-snug text-foreground/90">{detail.goal}</p>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <ListChecks className="h-3 w-3" />
          {detail.stepCount}/{detail.totalSteps}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {detail.duration}
        </span>
        <span className="inline-flex items-center gap-1">
          <Cpu className="h-3 w-3" />
          {formatTokens(detail.tokensUsed)} tokens
        </span>
        <span className="ml-auto tabular-nums">{pct}%</span>
      </div>

      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className={cn(
            "h-full rounded-full",
            complete ? "bg-diff-add" : "bg-primary",
          )}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
    </Card>
  );
}

/** Live upload transfers driven by the simulation sidecar. */
function UploadCard() {
  const uploads = useWorkspace((s) => s.uploads);
  if (uploads.length === 0) return null;

  return (
    <Card>
      <CardHeader
        icon={<UploadIcon className="h-3.5 w-3.5" />}
        title="Transfers"
        right={
          <span className="text-[10px] text-muted-foreground">
            {uploads.length} active
          </span>
        }
      />
      <ul className="space-y-2">
        {uploads.map((u) => (
          <li key={u.id} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="truncate text-foreground/80">{u.name}</span>
              <span className="tabular-nums text-muted-foreground">
                {u.done ? "done" : `${Math.round(u.progress)}%`}
              </span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  u.done ? "bg-diff-add" : "bg-primary",
                )}
                initial={false}
                animate={{ width: `${u.progress}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 22 }}
              />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function ProgressCard() {
  const detail = useWorkspace((s) => s.detail)!;
  const toggle = useWorkspace((s) => s.toggleChecklistItem);

  return (
    <Card>
      <CardHeader
        icon={<Flag className="h-3.5 w-3.5" />}
        title="Progress"
        right={
          <span className="text-[10px] text-muted-foreground">
            {detail.checklist.filter((c) => c.done).length}/
            {detail.checklist.length}
          </span>
        }
      />
      <ul className="space-y-1.5">
        {detail.checklist.map((c) => (
          <li key={c.id}>
            <button
              onClick={() => toggle(c.id)}
              className="flex w-full items-start gap-2 rounded-md px-1.5 py-1 text-left text-xs hover:bg-accent/50"
            >
              {c.done ? (
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-diff-add" />
              ) : (
                <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              )}
              <span
                className={cn(
                  "leading-snug",
                  c.done
                    ? "text-muted-foreground line-through"
                    : "text-foreground/90",
                )}
              >
                {c.text}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
