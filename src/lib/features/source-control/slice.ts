import type { StateCreator } from "zustand";
import { seedSourceControl, type SourceControlTool } from "@/lib/source-control";
import type { WorkspaceState } from "@/lib/store";

export interface SourceControlSlice {
  sourceControl: SourceControlTool[];
  sourceControlLastChecked: number; // epoch ms
  toggleSourceControl: (id: string) => void;
  setFetchInterval: (id: string, seconds: number) => void;
  refreshSourceControl: () => void;
}

export const createSourceControlSlice: StateCreator<
  WorkspaceState,
  [],
  [],
  SourceControlSlice
> = (set) => ({
  sourceControl: seedSourceControl,
  sourceControlLastChecked: Date.now(),

  toggleSourceControl: (id) =>
    set((s) => ({
      sourceControl: s.sourceControl.map((t) =>
        t.id === id && t.toggleable ? { ...t, enabled: !t.enabled } : t,
      ),
    })),

  setFetchInterval: (id, seconds) =>
    set((s) => ({
      sourceControl: s.sourceControl.map((t) =>
        t.id === id
          ? { ...t, fetchIntervalSeconds: Math.max(0, seconds) }
          : t,
      ),
    })),

  refreshSourceControl: () =>
    set({ sourceControlLastChecked: Date.now() }),
});
