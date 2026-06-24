import type { StateCreator } from "zustand";
import type {
  FileChange,
  TaskDetail,
  WorkspaceMessage,
  WorkspaceTask,
} from "@/lib/types";
import type { WorkspaceState } from "@/lib/store";

function dedupeBranches(branches: string[]): string[] {
  return Array.from(new Set(branches));
}

export interface TaskProgressSlice {
  // Task list (left sidebar)
  tasks: WorkspaceTask[];
  activeTaskId: string;
  // Detail of the currently active task
  detail: TaskDetail | null;
  detailLoading: boolean;
  // Repository branches (git panel) — owned here because setBranch/createBranch
  // update branches + detail.branch + tasks[].branch atomically.
  branches: string[];

  setActiveTask: (id: string) => void;
  setDetail: (detail: TaskDetail) => void;
  setDetailLoading: (loading: boolean) => void;
  setBranch: (branch: string) => void;
  createBranch: (name: string) => void;
  appendMessage: (msg: WorkspaceMessage) => void;
  toggleChecklistItem: (id: string) => void;
  updateFileChange: (id: string, patch: Partial<FileChange>) => void;
  deleteTask: (id: string) => void;
  addTask: (task: WorkspaceTask) => void;
  /** Add a task to the list WITHOUT changing the active task (background arrival). */
  addTaskSilent: (task: WorkspaceTask) => void;
  hydrate: (tasks: WorkspaceTask[], activeTaskId: string) => void;
  /** Patch a task's scalar fields (e.g. stepCount, tokensUsed) in BOTH tasks[] and detail. */
  patchTask: (taskId: string, patch: Partial<WorkspaceTask>) => void;
  /** Mark checklist items done (simulation-driven) by id, without toggling. */
  markChecklistDone: (ids: string[]) => void;
  /** Add a file change to the active detail if missing (used by sim:file-change). */
  addFileChange: (fc: FileChange) => void;
}

export const createTaskProgressSlice: StateCreator<
  WorkspaceState,
  [],
  [],
  TaskProgressSlice
> = (set) => ({
  tasks: [],
  activeTaskId: "",
  detail: null,
  detailLoading: false,
  branches: dedupeBranches([
    "main",
    "develop",
    "feat/gomoku-ai",
    "feat/onboarding-prompts",
    "feat/homepage-refresh",
    "feat/pricing-faq",
    "feat/docs-search",
  ]),

  setActiveTask: (id) => set({ activeTaskId: id }),
  setDetail: (detail) => set({ detail }),
  setDetailLoading: (loading) => set({ detailLoading: loading }),

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
        s.activeTaskId === id ? tasks[0]?.id ?? "" : s.activeTaskId;
      return { tasks, activeTaskId };
    }),

  addTask: (task) =>
    set((s) => ({ tasks: [task, ...s.tasks], activeTaskId: task.id })),

  addTaskSilent: (task) =>
    set((s) =>
      s.tasks.some((t) => t.id === task.id)
        ? {}
        : { tasks: [task, ...s.tasks] },
    ),

  hydrate: (tasks, activeTaskId) => set({ tasks, activeTaskId }),

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
});
