import type { StateCreator } from "zustand";
import type { SimStatus } from "@/lib/types";
import type { WorkspaceState } from "@/lib/store";

export interface SimulationSlice {
  simStatus: SimStatus;
  simPaused: boolean;
  setSimStatus: (status: SimStatus) => void;
  setSimPaused: (paused: boolean) => void;
}

export const createSimulationSlice: StateCreator<
  WorkspaceState,
  [],
  [],
  SimulationSlice
> = (set) => ({
  simStatus: "connecting",
  simPaused: false,

  setSimStatus: (status) => set({ simStatus: status }),
  setSimPaused: (paused) => set({ simPaused: paused }),
});
