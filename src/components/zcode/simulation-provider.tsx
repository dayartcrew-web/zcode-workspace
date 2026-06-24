"use client";

import { createContext, useContext, useMemo } from "react";
import { MotionConfig } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSimulation, type SimulationApi } from "@/lib/useSimulation";

const SimulationContext = createContext<SimulationApi | null>(null);

/** Read the simulation API (e.g. to call requestChat from the composer). */
export function useSimulationApi(): SimulationApi | null {
  return useContext(SimulationContext);
}

const STATUS_META: Record<
  SimulationApi["status"],
  { label: string; dot: string; text: string; pulse: boolean }
> = {
  connected: {
    label: "Live",
    dot: "bg-emerald-400",
    text: "text-emerald-400",
    pulse: false,
  },
  connecting: {
    label: "Connecting",
    dot: "bg-amber-400",
    text: "text-amber-400",
    pulse: true,
  },
  disconnected: {
    label: "Offline",
    dot: "bg-zinc-500",
    text: "text-muted-foreground",
    pulse: false,
  },
  offline: {
    label: "Offline",
    dot: "bg-zinc-600",
    text: "text-muted-foreground",
    pulse: false,
  },
};

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const api = useSimulation();
  const value = useMemo(() => api, [api]);

  return (
    <SimulationContext.Provider value={value}>
      {/* Respect the OS "reduce motion" preference globally. */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </SimulationContext.Provider>
  );
}

/** Compact live status chip with a play/pause control, for the sidebar header. */
export function SimulationStatusBadge() {
  const api = useSimulationApi();
  if (!api) return null;
  const meta = STATUS_META[api.status];

  return (
    <div className="flex items-center gap-1">
      <div
        className={cn(
          "flex items-center gap-1.5 rounded-full border border-border/60 px-2 py-0.5",
          api.status === "connected" && "bg-emerald-400/5",
        )}
        title={
          api.status === "connected"
            ? "Simulation sidecar connected — streaming live events"
            : api.status === "connecting"
              ? "Connecting to simulation sidecar…"
              : "Simulation sidecar offline — showing static seed data"
        }
      >
        <span className="relative flex h-1.5 w-1.5">
          {meta.pulse && (
            <span
              className={cn(
                "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                meta.dot,
              )}
            />
          )}
          <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", meta.dot)} />
        </span>
        <span className={cn("text-xs font-medium leading-none", meta.text)}>
          {meta.label}
        </span>
      </div>
      {api.status === "connected" && (
        <button
          type="button"
          aria-label={api.paused ? "Resume simulation" : "Pause simulation"}
          onClick={() => (api.paused ? api.resume() : api.pause())}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          {api.paused ? (
            <Play className="h-3 w-3" />
          ) : (
            <Pause className="h-3 w-3" />
          )}
        </button>
      )}
    </div>
  );
}
