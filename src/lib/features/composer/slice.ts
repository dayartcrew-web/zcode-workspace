import type { StateCreator } from "zustand";
import type { WorkspaceState } from "@/lib/store";

export type ComposerMode = "ask" | "plan" | "auto";

export interface ComposerSlice {
  composerValue: string;
  composerMode: ComposerMode;
  model: string;
  effort: "low" | "medium" | "high" | "max";
  askBeforeChanges: boolean;
  setComposerValue: (v: string) => void;
  setComposerMode: (m: ComposerMode) => void;
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
  // keep in sync: "plan" behaves like "ask" (no auto-apply), "auto" applies freely.
  toggleAskBeforeChanges: () =>
    set((s) => ({ askBeforeChanges: !s.askBeforeChanges })),
});
