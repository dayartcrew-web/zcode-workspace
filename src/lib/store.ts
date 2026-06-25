"use client";

import { create } from "zustand";
import type {
  ChecklistItem,
  FileChange,
  TaskDetail,
  Upload,
  WorkspaceMessage,
  WorkspaceTask,
} from "@/lib/types";
import { createTaskProgressSlice, type TaskProgressSlice } from "@/lib/features/task-progress";
import { createChatStreamingSlice, type ChatStreamingSlice } from "@/lib/features/chat-streaming";
import { createFileChangesSlice, type FileChangesSlice } from "@/lib/features/file-changes";
import { createUploadsSlice, type UploadsSlice } from "@/lib/features/uploads";
import {
  createSettingsSlice,
  type AppView,
  type SettingsSection,
  type SettingsState,
  type SettingsSlice,
} from "@/lib/features/settings";
import { createComposerSlice, type ComposerSlice } from "@/lib/features/composer";
import {
  createConnectionsSlice,
  type ConnectionsSlice,
  type RemoteEnvironment,
} from "@/lib/features/connections";
import { createProvidersSlice, type ProvidersSlice } from "@/lib/features/providers";
import { createSourceControlSlice, type SourceControlSlice } from "@/lib/features/source-control";

/**
 * WorkspaceState is the intersection of all feature slices. Each feature owns
 * its own state + actions under src/lib/features/<feature>/.
 */
export interface WorkspaceState
  extends TaskProgressSlice,
    ChatStreamingSlice,
    FileChangesSlice,
    UploadsSlice,
    SettingsSlice,
    ComposerSlice,
    ConnectionsSlice,
    ProvidersSlice,
    SourceControlSlice {}

export const useWorkspace = create<WorkspaceState>()((...args) => ({
  ...createTaskProgressSlice(...args),
  ...createChatStreamingSlice(...args),
  ...createFileChangesSlice(...args),
  ...createUploadsSlice(...args),
  ...createSettingsSlice(...args),
  ...createComposerSlice(...args),
  ...createConnectionsSlice(...args),
  ...createProvidersSlice(...args),
  ...createSourceControlSlice(...args),
}));

// Re-export types that components import from "@/lib/store" for back-compat.
export type {
  WorkspaceTask,
  TaskDetail,
  WorkspaceMessage,
  ChecklistItem,
  FileChange,
  Upload,
};
export type { RemoteEnvironment, SettingsState, AppView, SettingsSection };
