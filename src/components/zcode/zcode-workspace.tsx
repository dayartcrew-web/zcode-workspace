"use client";

import { useCallback, useEffect, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useWorkspace } from "@/lib/store";
import { LeftSidebar } from "./left-sidebar";
import { CentralContent } from "./central-content";
import { RightSidebar } from "./right-sidebar";
import { SettingsView } from "./settings-view";
import { SimulationProvider } from "./simulation-provider";
import { buildTaskDetail } from "@/lib/seed-data";
import type { TaskDetail, WorkspaceTask } from "@/lib/types";

export function ZcodeWorkspace() {
  const tasks = useWorkspace((s) => s.tasks);
  const activeTaskId = useWorkspace((s) => s.activeTaskId);
  const view = useWorkspace((s) => s.view);
  const setDetail = useWorkspace((s) => s.setDetail);
  const setDetailLoading = useWorkspace((s) => s.setDetailLoading);
  const hydrate = useWorkspace((s) => s.hydrate);
  const [bootError, setBootError] = useState<string | null>(null);
  const [booted, setBooted] = useState(false);

  // Initial load of the task list
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
        const msg = err instanceof Error ? err.message : "Unknown error";
        setBootError(msg);
        setBooted(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrate]);

  // Load detail whenever the active task changes
  const loadDetail = useCallback(
    async (id: string) => {
      if (!id) return;
      setDetailLoading(true);
      try {
        // Live-simulated tasks (added via the websocket sidecar) are never in
        // the seed data, so skip the network round-trip and build a local
        // detail directly. Avoids a guaranteed 404 + console noise.
        if (id.startsWith("task-sim-")) {
          const task = useWorkspace.getState().tasks.find((t) => t.id === id);
          if (task) {
            setDetail(buildTaskDetail(task));
            return;
          }
        }
        const res = await fetch(`/api/tasks/${id}`, { cache: "no-store" });
        if (!res.ok) {
          // 404 for tasks not in seed data (e.g. live-simulated tasks added
          // via the websocket sidecar). Fabricate a plausible detail locally
          // instead of erroring, so those tasks remain openable.
          if (res.status === 404) {
            const task = useWorkspace.getState().tasks.find((t) => t.id === id);
            if (task) {
              setDetail(buildTaskDetail(task));
              return;
            }
          }
          throw new Error(`HTTP ${res.status}`);
        }
        const data = (await res.json()) as { detail: TaskDetail };
        setDetail(data.detail);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setBootError(msg);
      } finally {
        setDetailLoading(false);
      }
    },
    [setDetail, setDetailLoading],
  );

  useEffect(() => {
    if (activeTaskId) void loadDetail(activeTaskId);
  }, [activeTaskId, loadDetail]);

  if (!booted) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Loading workspace…
      </div>
    );
  }

  if (bootError && tasks.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <span>Failed to load workspace.</span>
        <span className="text-xs">{bootError}</span>
      </div>
    );
  }

  return (
    <SimulationProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-background">
        {view === "settings" ? (
          <SettingsView />
        ) : (
          <PanelGroup direction="horizontal" autoSaveId="zcode-layout">
            {/* Left sidebar — fixed narrow */}
            <Panel
              defaultSize={20}
              minSize={16}
              maxSize={28}
              className="hidden sm:block"
            >
              <LeftSidebar />
            </Panel>
            <PanelResizeHandle className="hidden sm:block w-px bg-border data-[resize-handle-state=drag]:bg-primary/50 transition-colors" />

            {/* Center */}
            <Panel defaultSize={56} minSize={36}>
              <CentralContent />
            </Panel>
            <PanelResizeHandle className="w-px bg-border data-[resize-handle-state=drag]:bg-primary/50 transition-colors" />

            {/* Right sidebar */}
            <Panel
              defaultSize={24}
              minSize={18}
              maxSize={34}
              className="hidden lg:block"
            >
              <RightSidebar />
            </Panel>
          </PanelGroup>
        )}
      </div>
    </SimulationProvider>
  );
}
