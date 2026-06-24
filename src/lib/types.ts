// Shared domain types for ZCode workspace

export type TaskStatus = "active" | "complete" | "archived";

export type MessageRole = "user" | "assistant" | "system";

export type MessageKind =
  | "text"
  | "command"
  | "file-update"
  | "description";

export interface FilePill {
  name: string;
  color: "purple" | "orange" | "yellow" | "blue" | "green" | "red";
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
  order: number;
}

export interface FileChange {
  id: string;
  name: string;
  language: string;
  diffAdd: number;
  diffDel: number;
}

export interface WorkspaceMessage {
  id: string;
  taskId: string;
  role: MessageRole;
  kind: MessageKind;
  content: string;
  command?: string;
  files?: FilePill[];
  diffAdd: number;
  diffDel: number;
  createdAt: string;
}

export interface WorkspaceTask {
  id: string;
  title: string;
  tags: string[];
  branch: string;
  project: string;
  goal: string;
  status: TaskStatus;
  model: string;
  tokensUsed: number;
  stepCount: number;
  totalSteps: number;
  duration: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskDetail extends WorkspaceTask {
  messages: WorkspaceMessage[];
  fileChanges: FileChange[];
  checklist: ChecklistItem[];
}
