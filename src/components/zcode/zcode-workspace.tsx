"use client";

import { useEffect, useState } from "react";
import { useWorkspace } from "@/lib/store";
import type { WorkspaceTask } from "@/lib/types";

/**
 * Minimal workspace shell.
 *
 * The demo UI (sidebars, settings view, composer, menus, source-control panel)
 * was removed in the teardown. This shell boots, fetches the task list from
 * /api/tasks to keep the client/server wiring exercised, and renders an empty
 * state. Build the real UI on top of this.
 */
export function ZcodeWorkspace() {
  const hydrate = useWorkspace((s) => s.hydrate);
  const [bootError, setBootError] = useState<string | null>(null);
  const [booted, setBooted] = useState(false);

  // Initial load of the task list — keeps the API contract exercised.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/tasks", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { tasks: WorkspaceTask[] };
        if (cancelled) return;
        hydrate(data.tasks, data.tasks[0]?.id ?? "");
        setBooted(true);
      } catch (err) {
        setBootError(err instanceof Error ? err.message : "Unknown error");
        setBooted(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrate]);

  if (!booted) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Loading workspace…
      </div>
    );
  }

  if (bootError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <span>Failed to load workspace.</span>
        <span className="text-xs">{bootError}</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold text-foreground">ZCode</h1>
        <p className="text-sm text-muted-foreground">
          Empty workspace shell. The demo UI was removed.
        </p>
        <p className="text-xs text-muted-foreground/70">
          Build the real interface on top of this shell.
        </p>
      </div>
    </div>
  );
}
