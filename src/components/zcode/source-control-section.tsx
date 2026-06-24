"use client";

import { useState } from "react";
import {
  RefreshCw,
  Minus,
  Plus,
  MoreVertical,
  GitPullRequest,
  DownloadCloud,
  UploadCloud,
  Settings2,
  KeyRound,
  FileText,
  RotateCw,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/lib/store";
import type { SourceControlTool, SCMStatus } from "@/lib/source-control";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function SourceControlSection() {
  const tools = useWorkspace((s) => s.sourceControl);
  const lastChecked = useWorkspace((s) => s.sourceControlLastChecked);
  const refresh = useWorkspace((s) => s.refreshSourceControl);

  const versionControl = tools.filter((t) => t.kind === "version-control");
  const providers = tools.filter((t) => t.kind === "provider");

  return (
    <div>
      {/* Version control */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Version Control
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              Checked {relativeFromNow(lastChecked)}
            </span>
            <button
              onClick={() => {
                refresh();
                toast.success("Source control re-checked");
              }}
              aria-label="Refresh"
              className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="space-y-2.5">
          {versionControl.map((t) => (
            <ScmCard key={t.id} tool={t} />
          ))}
        </div>
      </div>

      {/* Source control providers */}
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Source Control Providers
        </h2>
        <div className="space-y-2.5">
          {providers.map((t) => (
            <ScmCard key={t.id} tool={t} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ SCM card ------------------------------ */

function ScmCard({ tool }: { tool: SourceControlTool }) {
  const toggle = useWorkspace((s) => s.toggleSourceControl);
  const [collapsed, setCollapsed] = useState(false);

  // Whether there's any body content to collapse
  const hasBody = Boolean(tool.description) || typeof tool.fetchIntervalSeconds === "number";

  return (
    <div className="rounded-lg border border-border bg-card/40">
      <div className="flex items-start gap-3 px-3.5 py-3">
        {/* Clickable header: logo + name/version/badge + chevron */}
        <button
          type="button"
          onClick={() => hasBody && setCollapsed((c) => !c)}
          aria-expanded={hasBody ? !collapsed : undefined}
          disabled={!hasBody}
          className="flex min-w-0 flex-1 items-start gap-3 text-left disabled:cursor-default"
        >
          <ScmLogo tool={tool} />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                {tool.name}
              </span>
              {tool.version && (
                <span className="font-mono text-xs text-muted-foreground">
                  {tool.version}
                </span>
              )}
              {tool.statusLabel && <StatusBadge status={tool.status} label={tool.statusLabel} />}
              {hasBody && (
                <ChevronDown
                  className={cn(
                    "ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
                    collapsed && "-rotate-90",
                  )}
                />
              )}
            </div>
            {!collapsed && (
              <>
                {tool.description && (
                  <p
                    className={cn(
                      "mt-1 text-xs leading-relaxed",
                      tool.status === "not-available"
                        ? "text-muted-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {tool.description}
                  </p>
                )}

                {/* Fetch interval stepper (Git only) */}
                {typeof tool.fetchIntervalSeconds === "number" && (
                  <FetchInterval tool={tool} />
                )}
              </>
            )}
          </div>
        </button>

        <div className="flex shrink-0 items-center gap-1 pt-0.5">
          <ScmActions tool={tool} />
          <Switch
            checked={tool.enabled}
            disabled={!tool.toggleable}
            onCheckedChange={() => toggle(tool.id)}
            aria-label={`Toggle ${tool.name}`}
          />
        </div>
      </div>
    </div>
  );
}

/* --------------------------- Actions dropdown --------------------------- */

function ScmActions({ tool }: { tool: SourceControlTool }) {
  const refresh = useWorkspace((s) => s.refreshSourceControl);

  // Only show the kebab for tools that are actually usable (available / authenticated)
  const actionable =
    tool.status === "available" || tool.status === "authenticated";
  if (!actionable) return null;

  const isGit = tool.id === "scm-git";
  const isProvider = tool.kind === "provider";

  function run(label: string, detail?: string) {
    refresh();
    toast.success(label, detail ? { description: detail } : undefined);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={`${tool.name} actions`}
          className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
          {tool.name} actions
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isGit && (
          <>
            <DropdownMenuItem
              onSelect={() =>
                run(
                  "Fetched remotes",
                  `Background fetch will run every ${tool.fetchIntervalSeconds ?? 30}s.`,
                )
              }
              className="gap-2 text-xs"
            >
              <RotateCw className="h-3.5 w-3.5" />
              Fetch now
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => run("Pull complete", "Fast-forward, no conflicts.")}
              className="gap-2 text-xs"
            >
              <DownloadCloud className="h-3.5 w-3.5" />
              Pull
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => run("Pushed to origin", "All branches up to date.")}
              className="gap-2 text-xs"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              Push
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() =>
                run("Opened git config", "Editing .git/config in a new tab.")
              }
              className="gap-2 text-xs"
            >
              <Settings2 className="h-3.5 w-3.5" />
              View git config
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                run("Opened git log", "Showing the last 50 commits.")
              }
              className="gap-2 text-xs"
            >
              <FileText className="h-3.5 w-3.5" />
              View log
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() =>
                run("Manage credentials", "Configure HTTPS / SSH auth.")
              }
              className="gap-2 text-xs"
            >
              <KeyRound className="h-3.5 w-3.5" />
              Authentication…
            </DropdownMenuItem>
          </>
        )}

        {isProvider && (
          <>
            <DropdownMenuItem
              onSelect={() =>
                run(`Refreshed ${tool.name} account`, "Re-checked auth and repos.")
              }
              className="gap-2 text-xs"
            >
              <RotateCw className="h-3.5 w-3.5" />
              Refresh account
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                run(`Open pull requests`, `Listing open PRs from ${tool.name}.`)
              }
              className="gap-2 text-xs"
            >
              <GitPullRequest className="h-3.5 w-3.5" />
              Pull requests
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                run(`Push to ${tool.name}`, "Pushed current branch to remote.")
              }
              className="gap-2 text-xs"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              Push
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() =>
                run(`Re-authenticate ${tool.name}`, "Open the OAuth flow again.")
              }
              className="gap-2 text-xs"
            >
              <KeyRound className="h-3.5 w-3.5" />
              Re-authenticate…
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ScmLogo({ tool }: { tool: SourceControlTool }) {
  return (
    <div
      className={cn(
        "grid h-8 w-8 shrink-0 place-items-center text-xs font-semibold leading-none",
        tool.logoShape === "circle" ? "rounded-full" : "rounded-md",
        tool.logoBg,
        tool.logoText,
      )}
    >
      {tool.logoLabel}
    </div>
  );
}

function StatusBadge({
  status,
  label,
}: {
  status: SCMStatus;
  label: string;
}) {
  const styles: Record<SCMStatus, string> = {
    available:
      "border-border bg-muted/60 text-muted-foreground",
    "coming-soon":
      "border-[oklch(0.72_0.18_55/0.4)] bg-[oklch(0.72_0.18_55/0.12)] text-[oklch(0.80_0.16_90)]",
    authenticated:
      "border-border bg-muted/60 text-muted-foreground",
    "not-authenticated":
      "border-[oklch(0.72_0.18_55/0.4)] bg-[oklch(0.72_0.18_55/0.12)] text-[oklch(0.80_0.16_90)]",
    "not-available":
      "border-border bg-muted/60 text-muted-foreground",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-medium",
        styles[status],
      )}
    >
      {label}
    </span>
  );
}

/* --------------------------- Fetch interval --------------------------- */

function FetchInterval({ tool }: { tool: SourceControlTool }) {
  const setFetchInterval = useWorkspace((s) => s.setFetchInterval);
  const value = tool.fetchIntervalSeconds ?? 30;

  function clamp(n: number) {
    return Math.max(0, Math.min(3600, n));
  }

  return (
    <div className="mt-3 rounded-md border border-border bg-background/40 p-3">
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-foreground">
          Fetch interval
        </span>
        <div className="flex items-center">
          <button
            onClick={() => setFetchInterval(tool.id, clamp(value - 5))}
            aria-label="Decrease interval"
            className="grid h-7 w-7 place-items-center rounded-l-md border border-r-0 border-border text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Minus className="h-3 w-3" />
          </button>
          <input
            type="number"
            value={value}
            min={0}
            onChange={(e) =>
              setFetchInterval(tool.id, clamp(Number(e.target.value) || 0))
            }
            className="h-7 w-14 border-y border-border bg-transparent text-center text-sm tabular-nums text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            onClick={() => setFetchInterval(tool.id, clamp(value + 5))}
            aria-label="Increase interval"
            className="grid h-7 w-7 place-items-center rounded-r-md border border-l-0 border-border text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
        <span className="text-xs text-muted-foreground">seconds</span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        Refresh remote branch status in the background. Set this to 0 seconds if
        Git credentials or security keys should only be prompted by explicit Git
        actions.
      </p>
    </div>
  );
}

/* ------------------------------ helpers ------------------------------ */

function relativeFromNow(epoch: number): string {
  const diff = Math.max(0, Date.now() - epoch);
  const sec = Math.floor(diff / 1000);
  if (sec < 5) return "just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  return `${hr}h ago`;
}
