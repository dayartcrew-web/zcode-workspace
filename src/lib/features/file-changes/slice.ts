import type { StateCreator } from "zustand";
import type { WorkspaceState } from "@/lib/store";

export interface FileChangesSlice {
  /** Selected file in the right-panel diff view (null = show git tools). */
  selectedFileId: string | null;
  /** Right panel active view. */
  rightPanelView: "tree" | "diff" | "git-tools";
  setSelectedFile: (id: string | null) => void;
  setRightPanelView: (v: "tree" | "diff" | "git-tools") => void;
}

export const createFileChangesSlice: StateCreator<
  WorkspaceState,
  [],
  [],
  FileChangesSlice
> = (set) => ({
  selectedFileId: null,
  rightPanelView: "git-tools",

  setSelectedFile: (id) => set({ selectedFileId: id }),
  setRightPanelView: (v) => set({ rightPanelView: v }),
});
