import type { StateCreator } from "zustand";
import type { Upload } from "@/lib/types";
import type { WorkspaceState } from "@/lib/store";

export interface UploadsSlice {
  uploads: Upload[];
  addUpload: (upload: Upload) => void;
  updateUpload: (id: string, patch: Partial<Upload>) => void;
  removeUpload: (id: string) => void;
}

export const createUploadsSlice: StateCreator<
  WorkspaceState,
  [],
  [],
  UploadsSlice
> = (set) => ({
  uploads: [],

  addUpload: (upload) => set((s) => ({ uploads: [...s.uploads, upload] })),

  updateUpload: (id, patch) =>
    set((s) => ({
      uploads: s.uploads.map((u) => (u.id === id ? { ...u, ...patch } : u)),
    })),

  removeUpload: (id) =>
    set((s) => ({ uploads: s.uploads.filter((u) => u.id !== id) })),
});
