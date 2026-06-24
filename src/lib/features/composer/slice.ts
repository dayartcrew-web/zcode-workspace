import type { StateCreator } from "zustand";
import type { WorkspaceState } from "@/lib/store";

export interface ComposerSlice {
  composerValue: string;
  composerMode: "ask" | "auto";
  model: string;
  effort: "low" | "medium" | "high" | "max";
  askBeforeChanges: boolean;
  setComposerValue: (v: string) => void;
  setComposerMode: (m: "ask" | "auto") => void;
  setModel: (m: string) => void;
  setEffort: (e: "low" | "medium" | "high" | "max") => void;
  toggleAskBeforeChanges: () => void;
}

export const createComposerSlice: StateCreator<
  WorkspaceState,
  [],
  [],
  ComposerSlice
> = (set) => ({
  composerValue: "",
  composerMode: "ask",
  model: "GLM-5.2",
  effort: "max",
  askBeforeChanges: true,

  setComposerValue: (v) => set({ composerValue: v }),
  setComposerMode: (m) => set({ composerMode: m }),
  setModel: (m) => set({ model: m }),
  setEffort: (e) => set({ effort: e }),
  toggleAskBeforeChanges: () =>
    set((s) => ({ askBeforeChanges: !s.askBeforeChanges })),
});
