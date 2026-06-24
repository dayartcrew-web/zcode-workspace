"use client";

import { create } from "zustand";
import type {
  WorkspaceTask,
  TaskDetail,
  WorkspaceMessage,
  ChecklistItem,
  FileChange,
  Upload,
  SimStatus,
} from "@/lib/types";
import {
  seedProviders,
  type Provider,
  type ProviderEnvVar,
  type AccentColor,
} from "@/lib/providers";
import {
  seedSourceControl,
  type SourceControlTool,
} from "@/lib/source-control";

export interface RemoteEnvironment {
  id: string;
  name: string;
  host: string;
  status: "online" | "offline" | "connecting";
}

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

interface WorkspaceState {
  // Task list (left sidebar)
  tasks: WorkspaceTask[];
  activeTaskId: string;

  // Detail of the currently active task
  detail: TaskDetail | null;
  detailLoading: boolean;

  // Composer state
  composerValue: string;
  composerMode: "ask" | "auto";
  model: string;
  effort: "low" | "medium" | "high" | "max";
  askBeforeChanges: boolean;

  // UI state
  leftNav: "docs" | "changelog" | "community";
  language: "en" | "zh";
  isSending: boolean;

  // Top-level view + settings
  view: AppView;
  settingsSection: SettingsSection;
  settings: SettingsState;

  // Providers
  providers: Provider[];
  providersLastChecked: number; // epoch ms

  // Source control
  sourceControl: SourceControlTool[];
  sourceControlLastChecked: number; // epoch ms

  // Repository branches (git panel)
  branches: string[];

  // Selected file in the right panel diff view (null = show git tools)
  selectedFileId: string | null;

  // Right panel active view
  rightPanelView: "tree" | "diff" | "git-tools";

  // Connections settings (This Environment toggles + remote environments)
  connections: {
    networkAccess: boolean;
    tailscaleHttps: boolean;
    t3Connect: boolean;
  };
  remoteEnvironments: RemoteEnvironment[];

  // Simulation (websocket sidecar) state
  simStatus: SimStatus;
  simPaused: boolean;
  /** Id of the assistant message currently streaming token-by-token (null = idle). */
  streamingMessageId: string | null;
  /** Partial content accumulated while streaming. */
  streamingContent: string;
  /** Live file transfers surfaced in the right panel. */
  uploads: Upload[];

  // Actions
  setActiveTask: (id: string) => void;
  setDetail: (detail: TaskDetail) => void;
  setDetailLoading: (loading: boolean) => void;
  setComposerValue: (v: string) => void;
  setComposerMode: (m: "ask" | "auto") => void;
  setModel: (m: string) => void;
  setEffort: (e: "low" | "medium" | "high" | "max") => void;
  toggleAskBeforeChanges: () => void;
  setLeftNav: (n: "docs" | "changelog" | "community") => void;
  setLanguage: (l: "en" | "zh") => void;
  setSending: (s: boolean) => void;
  setView: (v: AppView) => void;
  setSettingsSection: (s: SettingsSection) => void;
  updateSettings: (patch: Partial<SettingsState>) => void;

  // Provider actions
  toggleProviderEnabled: (id: string) => void;
  toggleProviderExpanded: (id: string) => void;
  updateProvider: (id: string, patch: Partial<Provider>) => void;
  setProviderAccent: (id: string, accent: AccentColor) => void;
  addEnvVar: (id: string) => void;
  updateEnvVar: (
    id: string,
    envId: string,
    patch: Partial<ProviderEnvVar>,
  ) => void;
  removeEnvVar: (id: string, envId: string) => void;
  toggleFavoriteModel: (id: string, modelId: string) => void;
  moveModel: (id: string, modelId: string, dir: -1 | 1) => void;
  refreshProviders: () => void;
  addProvider: () => void;

  // Source control actions
  toggleSourceControl: (id: string) => void;
  setFetchInterval: (id: string, seconds: number) => void;
  refreshSourceControl: () => void;

  // Branch actions (git panel)
  setBranch: (branch: string) => void;
  createBranch: (name: string) => void;

  // File diff view (right panel)
  setSelectedFile: (id: string | null) => void;
  setRightPanelView: (v: "tree" | "diff" | "git-tools") => void;

  // Connections actions
  toggleConnection: (key: "networkAccess" | "tailscaleHttps" | "t3Connect") => void;
  addRemoteEnvironment: () => void;
  removeRemoteEnvironment: (id: string) => void;

  // Mutations
  appendMessage: (msg: WorkspaceMessage) => void;
  toggleChecklistItem: (id: string) => void;
  updateFileChange: (id: string, patch: Partial<FileChange>) => void;
  deleteTask: (id: string) => void;
  addTask: (task: WorkspaceTask) => void;
  /** Add a task to the list WITHOUT changing the active task (background arrival). */
  addTaskSilent: (task: WorkspaceTask) => void;
  hydrate: (tasks: WorkspaceTask[], activeTaskId: string) => void;

  // Simulation actions
  setSimStatus: (status: SimStatus) => void;
  setSimPaused: (paused: boolean) => void;
  /** Begin streaming a new assistant message; returns nothing — the id is provided. */
  startStreaming: (messageId: string) => void;
  /** Append a token/word chunk to the in-flight streaming message. */
  appendStreamingToken: (token: string) => void;
  /** Finalize streaming: commit the message into detail.messages and clear state. */
  finishStreaming: (message: WorkspaceMessage) => void;
  /** Discard the in-flight stream without committing (e.g. on disconnect). */
  cancelStreaming: () => void;
  addUpload: (upload: Upload) => void;
  updateUpload: (id: string, patch: Partial<Upload>) => void;
  removeUpload: (id: string) => void;
  /** Patch a task's scalar fields (e.g. stepCount, tokensUsed) in BOTH tasks[] and detail. */
  patchTask: (taskId: string, patch: Partial<WorkspaceTask>) => void;
  /** Mark checklist items done (simulation-driven) by id, without toggling. */
  markChecklistDone: (ids: string[]) => void;
  /** Add a file change to the active detail if missing (used by sim:file-change). */
  addFileChange: (fc: FileChange) => void;
}

export const useWorkspace = create<WorkspaceState>((set) => ({
  tasks: [],
  activeTaskId: "",
  detail: null,
  detailLoading: false,
  composerValue: "",
  composerMode: "ask",
  model: "GLM-5.2",
  effort: "max",
  askBeforeChanges: true,
  leftNav: "docs",
  language: "en",
  isSending: false,
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
  providers: seedProviders,
  providersLastChecked: Date.now(),
  sourceControl: seedSourceControl,
  sourceControlLastChecked: Date.now(),
  branches: dedupeBranches([
    "main",
    "develop",
    "feat/gomoku-ai",
    "feat/onboarding-prompts",
    "feat/homepage-refresh",
    "feat/pricing-faq",
    "feat/docs-search",
  ]),
  selectedFileId: null,
  rightPanelView: "git-tools",
  connections: {
    networkAccess: false,
    tailscaleHttps: false,
    t3Connect: false,
  },
  remoteEnvironments: [],

  // Simulation initial state
  simStatus: "connecting",
  simPaused: false,
  streamingMessageId: null,
  streamingContent: "",
  uploads: [],

  setActiveTask: (id) => set({ activeTaskId: id }),
  setDetail: (detail) => set({ detail }),
  setDetailLoading: (loading) => set({ detailLoading: loading }),
  setComposerValue: (v) => set({ composerValue: v }),
  setComposerMode: (m) => set({ composerMode: m }),
  setModel: (m) => set({ model: m }),
  setEffort: (e) => set({ effort: e }),
  toggleAskBeforeChanges: () =>
    set((s) => ({ askBeforeChanges: !s.askBeforeChanges })),
  setLeftNav: (n) => set({ leftNav: n }),
  setLanguage: (l) => set({ language: l }),
  setSending: (s) => set({ isSending: s }),
  setView: (v) => set({ view: v }),
  setSettingsSection: (s) => set({ settingsSection: s }),
  updateSettings: (patch) =>
    set((s) => ({ settings: { ...s.settings, ...patch } })),

  // ---- Provider actions ----
  toggleProviderEnabled: (id) =>
    set((s) => ({
      providers: s.providers.map((p) =>
        p.id === id ? { ...p, enabled: !p.enabled } : p,
      ),
    })),

  toggleProviderExpanded: (id) =>
    set((s) => ({
      providers: s.providers.map((p) =>
        p.id === id ? { ...p, expanded: !p.expanded } : p,
      ),
    })),

  updateProvider: (id, patch) =>
    set((s) => ({
      providers: s.providers.map((p) =>
        p.id === id ? { ...p, ...patch } : p,
      ),
    })),

  setProviderAccent: (id, accent) =>
    set((s) => ({
      providers: s.providers.map((p) =>
        p.id === id ? { ...p, accent } : p,
      ),
    })),

  addEnvVar: (id) =>
    set((s) => ({
      providers: s.providers.map((p) =>
        p.id === id
          ? {
              ...p,
              envVars: [
                ...p.envVars,
                {
                  id: `env-${Date.now()}`,
                  key: "",
                  value: "",
                },
              ],
            }
          : p,
      ),
    })),

  updateEnvVar: (id, envId, patch) =>
    set((s) => ({
      providers: s.providers.map((p) =>
        p.id === id
          ? {
              ...p,
              envVars: p.envVars.map((e) =>
                e.id === envId ? { ...e, ...patch } : e,
              ),
            }
          : p,
      ),
    })),

  removeEnvVar: (id, envId) =>
    set((s) => ({
      providers: s.providers.map((p) =>
        p.id === id
          ? { ...p, envVars: p.envVars.filter((e) => e.id !== envId) }
          : p,
      ),
    })),

  toggleFavoriteModel: (id, modelId) =>
    set((s) => ({
      providers: s.providers.map((p) =>
        p.id === id
          ? {
              ...p,
              models: p.models.map((m) =>
                m.id === modelId ? { ...m, favorite: !m.favorite } : m,
              ),
            }
          : p,
      ),
    })),

  moveModel: (id, modelId, dir) =>
    set((s) => ({
      providers: s.providers.map((p) => {
        if (p.id !== id) return p;
        const idx = p.models.findIndex((m) => m.id === modelId);
        if (idx === -1) return p;
        const next = idx + dir;
        if (next < 0 || next >= p.models.length) return p;
        const models = [...p.models];
        const [moved] = models.splice(idx, 1);
        models.splice(next, 0, moved);
        return { ...p, models };
      }),
    })),

  refreshProviders: () => set({ providersLastChecked: Date.now() }),

  addProvider: () =>
    set((s) => ({
      providers: [
        ...s.providers,
        {
          id: `prov-custom-${Date.now()}`,
          slug: "custom",
          name: "New Provider",
          version: undefined,
          earlyAccess: false,
          status: "disabled",
          statusDetail: "Not configured — set a binary path to begin.",
          enabled: false,
          expanded: true,
          accent: "blue",
          iconShape: "circle",
          iconBg: "bg-[oklch(0.62_0.18_255)]",
          iconText: "text-white",
          iconLabel: "N",
          displayName: "New Provider",
          binaryPath: "",
          homePath: "~/",
          homePathLabel: "HOME path",
          shadowHomePath: "~/",
          envVars: [],
          models: [],
        },
      ],
    })),

  // ---- Source control actions ----
  toggleSourceControl: (id) =>
    set((s) => ({
      sourceControl: s.sourceControl.map((t) =>
        t.id === id && t.toggleable
          ? { ...t, enabled: !t.enabled }
          : t,
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

  // ---- Branch actions (git panel) ----
  setBranch: (branch) =>
    set((s) => {
      if (!s.detail) return {};
      const branches = s.branches.includes(branch)
        ? s.branches
        : [...s.branches, branch];
      return {
        branches,
        detail: { ...s.detail, branch },
        tasks: s.tasks.map((t) =>
          t.id === s.detail!.id ? { ...t, branch } : t,
        ),
      };
    }),

  createBranch: (name) =>
    set((s) => {
      const trimmed = name.trim();
      if (!trimmed || !s.detail) return {};
      const branches = s.branches.includes(trimmed)
        ? s.branches
        : [...s.branches, trimmed];
      return {
        branches,
        detail: { ...s.detail!, branch: trimmed },
        tasks: s.tasks.map((t) =>
          t.id === s.detail!.id ? { ...t, branch: trimmed } : t,
        ),
      };
    }),

  setSelectedFile: (id) => set({ selectedFileId: id }),
  setRightPanelView: (v) => set({ rightPanelView: v }),

  // ---- Connections actions ----
  toggleConnection: (key) =>
    set((s) => ({
      connections: { ...s.connections, [key]: !s.connections[key] },
    })),

  addRemoteEnvironment: () =>
    set((s) => ({
      remoteEnvironments: [
        ...s.remoteEnvironments,
        {
          id: `env-${Date.now()}`,
          name: `Remote ${s.remoteEnvironments.length + 1}`,
          host: "user@host",
          status: "connecting" as const,
        },
      ],
    })),

  removeRemoteEnvironment: (id) =>
    set((s) => ({
      remoteEnvironments: s.remoteEnvironments.filter((e) => e.id !== id),
    })),

  appendMessage: (msg) =>
    set((s) => {
      if (!s.detail) return {};
      return {
        detail: {
          ...s.detail,
          messages: [...s.detail.messages, msg],
          updatedAt: new Date().toISOString(),
        },
      };
    }),

  toggleChecklistItem: (id) =>
    set((s) => {
      if (!s.detail) return {};
      return {
        detail: {
          ...s.detail,
          checklist: s.detail.checklist.map((c) =>
            c.id === id ? { ...c, done: !c.done } : c,
          ),
        },
      };
    }),

  updateFileChange: (id, patch) =>
    set((s) => {
      if (!s.detail) return {};
      return {
        detail: {
          ...s.detail,
          fileChanges: s.detail.fileChanges.map((f) =>
            f.id === id ? { ...f, ...patch } : f,
          ),
        },
      };
    }),

  deleteTask: (id) =>
    set((s) => {
      const tasks = s.tasks.filter((t) => t.id !== id);
      const activeTaskId =
        s.activeTaskId === id
          ? tasks[0]?.id ?? ""
          : s.activeTaskId;
      return { tasks, activeTaskId };
    }),

  addTask: (task) =>
    set((s) => ({ tasks: [task, ...s.tasks], activeTaskId: task.id })),

  addTaskSilent: (task) =>
    set((s) => (s.tasks.some((t) => t.id === task.id) ? {} : { tasks: [task, ...s.tasks] })),

  hydrate: (tasks, activeTaskId) => set({ tasks, activeTaskId }),

  // ---- Simulation actions ----
  setSimStatus: (status) => set({ simStatus: status }),

  setSimPaused: (paused) => set({ simPaused: paused }),

  startStreaming: (messageId) =>
    set({ streamingMessageId: messageId, streamingContent: "" }),

  appendStreamingToken: (token) =>
    set((s) =>
      s.streamingMessageId
        ? { streamingContent: s.streamingContent + token }
        : {},
    ),

  finishStreaming: (message) =>
    set((s) => {
      if (!s.detail) {
        return { streamingMessageId: null, streamingContent: "" };
      }
      return {
        streamingMessageId: null,
        streamingContent: "",
        detail: {
          ...s.detail,
          messages: [...s.detail.messages, message],
          updatedAt: new Date().toISOString(),
        },
      };
    }),

  cancelStreaming: () => set({ streamingMessageId: null, streamingContent: "" }),

  addUpload: (upload) =>
    set((s) => ({ uploads: [...s.uploads, upload] })),

  updateUpload: (id, patch) =>
    set((s) => ({
      uploads: s.uploads.map((u) => (u.id === id ? { ...u, ...patch } : u)),
    })),

  removeUpload: (id) =>
    set((s) => ({ uploads: s.uploads.filter((u) => u.id !== id) })),

  patchTask: (taskId, patch) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)),
      detail:
        s.detail && s.detail.id === taskId
          ? { ...s.detail, ...patch }
          : s.detail,
    })),

  markChecklistDone: (ids) =>
    set((s) => {
      if (!s.detail) return {};
      const idSet = new Set(ids);
      return {
        detail: {
          ...s.detail,
          checklist: s.detail.checklist.map((c) =>
            idSet.has(c.id) ? { ...c, done: true } : c,
          ),
        },
      };
    }),

  addFileChange: (fc) =>
    set((s) => {
      if (!s.detail) return {};
      if (s.detail.fileChanges.some((f) => f.id === fc.id)) return {};
      return {
        detail: {
          ...s.detail,
          fileChanges: [...s.detail.fileChanges, fc],
        },
      };
    }),
}));

function dedupeBranches(branches: string[]): string[] {
  return Array.from(new Set(branches));
}

export type { WorkspaceState };
export type {
  WorkspaceTask,
  TaskDetail,
  WorkspaceMessage,
  ChecklistItem,
  FileChange,
  Upload,
  SimStatus,
};
