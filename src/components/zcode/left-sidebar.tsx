"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Star,
  RefreshCw,
  UserRound,
  LayoutGrid,
  Menu,
  Search,
  ChevronRight,
  FolderGit2,
  Plus,
  FolderOpen,
  Globe,
  Loader2,
  Check,
  WifiOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/lib/store";
import { relativeTime } from "@/lib/format";
import type { WorkspaceTask } from "@/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { RemoteConnectDialog } from "./remote-connect-dialog";
import { SimulationStatusBadge } from "./simulation-provider";

export function LeftSidebar() {
  const tasks = useWorkspace((s) => s.tasks);
  const activeTaskId = useWorkspace((s) => s.activeTaskId);
  const setActiveTask = useWorkspace((s) => s.setActiveTask);
  const setView = useWorkspace((s) => s.setView);

  // Group tasks by project, preserving first-seen order
  const groups = useMemo(() => {
    const map = new Map<string, WorkspaceTask[]>();
    for (const t of tasks) {
      const key = t.project || "ungrouped";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return Array.from(map.entries());
  }, [tasks]);

  // Track collapsed state per project. Default: the group containing the
  // active task is expanded, others collapsed.
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  function isCollapsed(project: string) {
    // If explicitly set, use it; otherwise collapse unless it contains the active task
    if (project in collapsed) return collapsed[project];
    const hasActive = groups
      .find(([p]) => p === project)?.[1]
      .some((t) => t.id === activeTaskId);
    return !hasActive;
  }

  function toggle(project: string) {
    setCollapsed((c) => ({ ...c, [project]: !isCollapsed(project) }));
  }

  return (
    <TooltipProvider delayDuration={400}>
      <aside className="flex h-full w-full flex-col bg-sidebar text-sidebar-foreground">
        {/* Top header: Workspaces + star + menu/search/trash */}
        <div className="flex items-center justify-between px-3 pt-4 pb-3">
          <div className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Workspaces
            </span>
          </div>
          <div className="flex items-center gap-0.5">
            <SimulationStatusBadge />
            <HeaderIcon
              icon={<Menu className="h-3.5 w-3.5" />}
              label="Menu"
              onClick={() => toast.info("Menu", { description: "Workspace options." })}
            />
            <HeaderIcon
              icon={<Search className="h-3.5 w-3.5" />}
              label="Search"
              shortcut="Ctrl+K"
              onClick={() => toast.info("Search", { description: "Search workspaces." })}
            />
            <NewWorkspacePopover />
          </div>
        </div>

        {/* Project groups */}
        <div className="scrollbar-thin flex-1 overflow-y-auto px-2 pb-2">
          {groups.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-muted-foreground">
              No workspaces yet
            </div>
          ) : (
            <ul className="space-y-1">
              {groups.map(([project, projectTasks]) => {
                const collapsedForProject = isCollapsed(project);
                const hasActive = projectTasks.some(
                  (t) => t.id === activeTaskId,
                );
                return (
                  <li key={project}>
                    <ProjectHeader
                      project={project}
                      count={projectTasks.length}
                      collapsed={collapsedForProject}
                      active={hasActive}
                      onToggle={() => toggle(project)}
                    />
                    {!collapsedForProject && (
                      <ul className="mt-0.5 space-y-0.5 pl-1">
                        {projectTasks.map((task) => (
                          <WorkspaceRow
                            key={task.id}
                            task={task}
                            active={task.id === activeTaskId}
                            onSelect={() => setActiveTask(task.id)}
                          />
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Bottom: connect + layout + settings */}
        <div className="mt-auto border-t border-border p-2">
          <div className="flex items-center gap-0.5">
            <button
              onClick={() =>
                toast.info("ZCode Connect", {
                  description: "Sign-in flow is coming soon.",
                })
              }
              className="flex flex-1 items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <UserRound className="h-3.5 w-3.5" />
              Connect
            </button>
            <button
              aria-label="Layout"
              onClick={() =>
                toast.info("Layout", { description: "Toggle panel layout." })
              }
              className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              aria-label="Settings"
              title="Settings"
              onClick={() => setView("settings")}
              className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}

/* ------------------------------ Header icon ------------------------------ */

function HeaderIcon({
  icon,
  label,
  shortcut,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  onClick?: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          aria-label={label}
          className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          {icon}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        <span className="font-medium">{label}</span>
        {shortcut && (
          <span className="ml-1.5 text-muted-foreground">{shortcut}</span>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

/* --------------------------- New workspace popover --------------------------- */

function NewWorkspacePopover() {
  const [query, setQuery] = useState("");
  const [remoteOpen, setRemoteOpen] = useState(false);

  const lower = query.trim().toLowerCase();
  const noMatch = lower.length > 0;

  return (
    <>
      <Popover>
        <Tooltip>
          <PopoverTrigger asChild>
            <TooltipTrigger asChild>
              <button
                aria-label="New workspace"
                className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
          </PopoverTrigger>
          <TooltipContent side="bottom" className="text-xs">
            <span className="font-medium">New workspace</span>
          </TooltipContent>
        </Tooltip>
        <PopoverContent
          side="bottom"
          align="end"
          sideOffset={6}
          className="w-72 p-0"
        >
          {/* Search */}
          <div className="border-b border-border p-2">
            <div className="flex items-center gap-2 rounded-md bg-background/60 px-2">
              <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search workspaces"
                className="h-8 border-0 bg-transparent px-0 text-xs text-foreground shadow-none focus-visible:ring-0"
              />
            </div>
          </div>

          {/* No matching workspaces (only when there's a query) */}
          {noMatch && (
            <p className="px-3 py-3 text-center text-xs text-muted-foreground">
              No matching workspaces
            </p>
          )}

          {/* Actions */}
          {!noMatch && (
            <div className="p-1.5">
              <button
                onClick={() =>
                  toast.info("Open folder", {
                    description: "Choose a local folder to open.",
                  })
                }
                className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-xs text-foreground/90 transition-colors hover:bg-accent"
              >
                <FolderOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="font-medium">Open folder</span>
              </button>
              <button
                onClick={() => setRemoteOpen(true)}
                className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-xs text-foreground/90 transition-colors hover:bg-accent"
              >
                <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="font-medium">Remote connection</span>
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      <RemoteConnectDialog open={remoteOpen} onOpenChange={setRemoteOpen} />
    </>
  );
}

/* ------------------------------ Project header ------------------------------ */

function ProjectHeader({
  project,
  count,
  collapsed,
  active,
  onToggle,
}: {
  project: string;
  count: number;
  collapsed: boolean;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      aria-expanded={!collapsed}
      className="group flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-accent/50"
    >
      <ChevronRight
        className={cn(
          "h-3 w-3 shrink-0 text-muted-foreground transition-transform",
          !collapsed && "rotate-90",
        )}
      />
      <FolderGit2
        className={cn(
          "h-3.5 w-3.5 shrink-0",
          active ? "text-primary" : "text-muted-foreground",
        )}
      />
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-xs font-semibold uppercase tracking-wider",
          active ? "text-foreground" : "text-muted-foreground",
        )}
        title={project}
      >
        {project}
      </span>
      <span className="shrink-0 rounded bg-muted/60 px-1.5 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
        {count}
      </span>
    </button>
  );
}

/* ------------------------------ Workspace row ------------------------------ */

function WorkspaceRow({
  task,
  active,
  onSelect,
}: {
  task: WorkspaceTask;
  active: boolean;
  onSelect: () => void;
}) {
  const initial = task.title.charAt(0).toUpperCase();

  // A task is "working" while it's active and not yet complete (has steps left).
  // The root workspace (0/0 steps) and complete/archived tasks show a static mark.
  const isComplete = task.status === "complete";
  const isWorking =
    task.status === "active" &&
    task.totalSteps > 0 &&
    task.stepCount < task.totalSteps;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
    >
      <button
        onClick={onSelect}
        className={cn(
          "group flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors",
          active
            ? "bg-accent text-foreground"
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
        )}
      >
        {/* Circular status avatar: spinner while working, check when done, initial otherwise */}
        <span
          className={cn(
            "grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-semibold",
            isComplete
              ? "bg-diff-add/20 text-diff-add"
              : isWorking
                ? "bg-primary/15 text-primary"
                : active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground group-hover:text-foreground",
          )}
        >
          {isWorking ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : isComplete ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            initial
          )}
        </span>

        {/* Title */}
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-xs font-medium",
            active ? "text-foreground" : "text-foreground/80",
          )}
          title={task.title}
        >
          {task.title}
        </span>

        {/* Sync indicator on the right: spinning while reconnecting, timestamp when connected, offline icon when down. */}
        <SyncIndicator active={active} updatedAt={task.updatedAt} />
      </button>
    </motion.li>
  );
}

/* --------------------------- Sync indicator --------------------------- */

/**
 * Right-aligned sync indicator on a workspace row.
 *   connecting → spinning RefreshCw (amber)
 *   connected  → relative timestamp like "2m" (faint; muted)
 *   disconnected/offline → WifiOff icon (red-tinted)
 *
 * Re-ticks every 15s so the relative timestamp stays fresh while idle.
 */
function SyncIndicator({
  active,
  updatedAt,
}: {
  active: boolean;
  updatedAt: string;
}) {
  const simStatus = useWorkspace((s) => s.simStatus);
  const [, tick] = useState(0);

  // Refresh the relative-time label periodically.
  useEffect(() => {
    const iv = setInterval(() => tick((n) => n + 1), 15000);
    return () => clearInterval(iv);
  }, []);

  const reconnecting = simStatus === "connecting" || simStatus === "disconnected";
  const offline = simStatus === "offline";

  if (reconnecting) {
    return (
      <RefreshCw className="h-3 w-3 shrink-0 animate-spin text-amber-400" />
    );
  }
  if (offline) {
    return (
      <WifiOff
        className={cn(
          "h-3 w-3 shrink-0 text-destructive/70",
          active ? "" : "opacity-70",
        )}
      />
    );
  }
  // Connected: relative timestamp of the last update.
  return (
    <span
      className={cn(
        "shrink-0 tabular-nums text-xs",
        active
          ? "text-muted-foreground"
          : "text-muted-foreground/40 group-hover:text-muted-foreground",
      )}
      title={`Last updated ${relativeTime(updatedAt)} ago`}
    >
      {relativeTime(updatedAt)}
    </span>
  );
}
