import type { StateCreator } from "zustand";
import type { WorkspaceState } from "@/lib/store";

export type AppView = "workspace" | "settings";

export type SettingsSection =
  | "appearance"
  | "keybindings"
  | "providers"
  | "source-control"
  | "connections"
  | "archive";

export interface SettingsState {
  theme: "dark" | "light" | "system";
  timeFormat: "system" | "12h" | "24h";
  diffLineWrapping: boolean;
  hideWhitespaceChanges: boolean;
  assistantOutput: boolean;
  autoOpenTaskPanel: boolean;
  newThreads: "local" | "cloud" | "shared";
  addProjectStartsIn: string;
  archiveConfirmation: boolean;
  deleteConfirmation: boolean;
}

export interface SettingsSlice {
  view: AppView;
  settingsSection: SettingsSection;
  settings: SettingsState;
  leftNav: "docs" | "changelog" | "community";
  language: "en" | "zh";
  isSending: boolean;
  setView: (v: AppView) => void;
  setSettingsSection: (s: SettingsSection) => void;
  updateSettings: (patch: Partial<SettingsState>) => void;
  setLeftNav: (n: "docs" | "changelog" | "community") => void;
  setLanguage: (l: "en" | "zh") => void;
  setSending: (s: boolean) => void;
}

export const createSettingsSlice: StateCreator<
  WorkspaceState,
  [],
  [],
  SettingsSlice
> = (set) => ({
  view: "workspace",
  settingsSection: "appearance",
  settings: {
    theme: "dark",
    timeFormat: "system",
    diffLineWrapping: true,
    hideWhitespaceChanges: false,
    assistantOutput: true,
    autoOpenTaskPanel: true,
    newThreads: "local",
    addProjectStartsIn: "~/",
    archiveConfirmation: true,
    deleteConfirmation: true,
  },
  leftNav: "docs",
  language: "en",
  isSending: false,

  setView: (v) => set({ view: v }),
  setSettingsSection: (s) => set({ settingsSection: s }),
  updateSettings: (patch) =>
    set((s) => ({ settings: { ...s.settings, ...patch } })),
  setLeftNav: (n) => set({ leftNav: n }),
  setLanguage: (l) => set({ language: l }),
  setSending: (s) => set({ isSending: s }),
});
