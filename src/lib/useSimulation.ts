"use client";

/**
 * useSimulation — connects to the optional websocket sidecar
 * (mini-services/sim-server.ts) and dispatches its events into the Zustand
 * store. Mirrors the connection pattern in examples/websocket/frontend.tsx:
 *   io("/?XTransformPort=4001", { transports:["websocket","polling"], ... })
 *
 * Graceful fallback: if the sidecar isn't running, the connect attempt times
 * out after ~2.5s, the status flips to "offline", and the app keeps working
 * on static seed data. The composer also keeps its original /api/chat path.
 */

import { useEffect, useRef } from "react";
import type { Socket } from "socket.io-client";
import { useWorkspace } from "@/lib/store";
import type {
  FileChange,
  FilePill,
  SimStatus,
  Upload,
  WorkspaceMessage,
  WorkspaceTask,
} from "@/lib/types";

/**
 * Sidecar port. Override with NEXT_PUBLIC_SIM_PORT for non-default setups.
 */
export const SIM_PORT = Number(process.env.NEXT_PUBLIC_SIM_PORT ?? 4001);

/**
 * Resolve the socket.io connection target + options.
 *
 * Two deployment shapes are supported:
 *
 * 1. Direct dev (no reverse proxy): the client connects straight to the
 *    sidecar at http://localhost:<SIM_PORT>, using path "/". This is the
 *    default and what `bun run dev` + `bun run sim` use.
 *
 * 2. Behind the Caddy proxy: set NEXT_PUBLIC_SIM_PROXY=1 so the client
 *    connects same-origin via "/?XTransformPort=<SIM_PORT>" (Caddy's
 *    @transform_port_query matcher routes it to the sidecar). This mirrors
 *    examples/websocket/frontend.tsx and is what the production Caddyfile
 *    expects.
 *
 * Both use path: "/" to match sim-server.ts (which intentionally uses "/"
 * rather than socket.io's default "/socket.io/").
 */
function resolveSimTarget(): { url: string; path: string } {
  // Explicit full URL wins (e.g. NEXT_PUBLIC_SIM_URL=http://box:4001).
  const explicit = process.env.NEXT_PUBLIC_SIM_URL;
  if (explicit) return { url: explicit, path: "/" };

  const useProxy = process.env.NEXT_PUBLIC_SIM_PROXY === "1";
  if (useProxy) {
    // Same-origin; Caddy reads XTransformPort and proxies to the sidecar.
    return { url: `/?XTransformPort=${SIM_PORT}`, path: "/" };
  }
  // Default: direct to the sidecar (dev without Caddy).
  return { url: `http://localhost:${SIM_PORT}`, path: "/" };
}

/* --------------------------- event payload types --------------------------- */

interface SimStatePayload {
  running: boolean;
  port?: number;
}
interface ChatStartPayload {
  taskId: string;
  messageId: string;
  role: "user" | "assistant" | "system";
}
interface ChatTokenPayload {
  taskId: string;
  messageId: string;
  token: string;
}
interface ChatEndPayload {
  taskId: string;
  messageId: string;
  content: string;
  tokensUsed: number;
}
interface ChatEndUpdatePayload {
  taskId: string;
  messageId: string;
  content: string;
  files: { name: string; color: FilePill["color"] }[];
  diffAdd: number;
  diffDel: number;
  command?: string;
  tokensUsed: number;
}
interface ChatEndCommandPayload {
  taskId: string;
  messageId: string;
  content: string;
  command: string;
  tokensUsed: number;
}
interface TaskProgressPayload {
  taskId: string;
  stepCount: number;
  totalSteps?: number;
  tokensUsed: number;
  checklistDone?: string[];
}
interface FileChangePayload {
  taskId: string;
  file: FileChange;
}
interface NewTaskPayload {
  task: WorkspaceTask;
}
interface UploadPayload {
  id: string;
  name: string;
  progress: number;
  done: boolean;
}

/* --------------------------------- hook ----------------------------------- */

export interface SimulationApi {
  status: SimStatus;
  paused: boolean;
  /** Request a streamed reply for a user-sent message. */
  requestChat: (taskId: string, prompt: string) => void;
  pause: () => void;
  resume: () => void;
}

export function useSimulation(): SimulationApi {
  const socketRef = useRef<Socket | null>(null);
  // Refs so the event handlers always read the latest store actions without
  // re-subscribing on every render.
  const actions = useWorkspace.getState;
  const activeTaskId = useWorkspace((s) => s.activeTaskId);
  const status = useWorkspace((s) => s.simStatus);
  const paused = useWorkspace((s) => s.simPaused);

  // Keep the sidecar informed of the currently viewed task.
  useEffect(() => {
    socketRef.current?.emit("sim:set-active", { taskId: activeTaskId });
  }, [activeTaskId]);

  useEffect(() => {
    // Client-only: never run during SSR.
    if (typeof window === "undefined") return;
    let disposed = false;
    let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

    // Dynamic import keeps socket.io-client out of the server bundle.
    void import("socket.io-client").then(({ io }) => {
      if (disposed) return;

      const { url, path } = resolveSimTarget();
      const socket = io(url, {
        path,
        transports: ["websocket", "polling"],
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 2500,
      });
      socketRef.current = socket;

      // If we don't connect quickly, mark offline and keep going on seed data.
      timeoutHandle = setTimeout(() => {
        if (!socket.connected) {
          actions().setSimStatus("offline");
        }
      }, 2800);

      // Commit a finalized streamed message + accrue its tokens on the task.
      const commitStreamed = (
        taskId: string,
        message: WorkspaceMessage,
        tokensUsed: number,
      ) => {
        actions().finishStreaming(message);
        if (tokensUsed) {
          const cur = useWorkspace.getState().tasks.find((t) => t.id === taskId);
          if (cur) {
            actions().patchTask(taskId, {
              tokensUsed: cur.tokensUsed + tokensUsed,
            });
          }
        }
      };

      socket.on("connect", () => {
        if (timeoutHandle) clearTimeout(timeoutHandle);
        actions().setSimStatus("connected");
        socket.emit("sim:set-active", {
          taskId: useWorkspace.getState().activeTaskId,
        });
      });

      socket.on("disconnect", () => {
        actions().setSimStatus("disconnected");
      });

      socket.io.on("reconnect_attempt", () => {
        actions().setSimStatus("connecting");
      });

      socket.on("sim:state", (payload: SimStatePayload) => {
        actions().setSimPaused(!payload.running);
      });

      // ---- AI chat streaming ----
      socket.on("sim:chat-start", ({ messageId }: ChatStartPayload) => {
        actions().startStreaming(messageId);
      });

      socket.on("sim:chat-token", ({ token }: ChatTokenPayload) => {
        actions().appendStreamingToken(token);
      });

      socket.on("sim:chat-end", (p: ChatEndPayload) => {
        const message: WorkspaceMessage = {
          id: p.messageId,
          taskId: p.taskId,
          role: "assistant",
          kind: "description",
          content: p.content,
          diffAdd: 0,
          diffDel: 0,
          createdAt: new Date().toISOString(),
        };
        commitStreamed(p.taskId, message, p.tokensUsed);
      });

      // file-update variant — renders file pills + diff badge, not plain text
      socket.on("sim:chat-end-update", (p: ChatEndUpdatePayload) => {
        const message: WorkspaceMessage = {
          id: p.messageId,
          taskId: p.taskId,
          role: "assistant",
          kind: "file-update",
          content: p.content,
          files: p.files as FilePill[],
          diffAdd: p.diffAdd,
          diffDel: p.diffDel,
          createdAt: new Date().toISOString(),
        };
        commitStreamed(p.taskId, message, p.tokensUsed);
      });

      // command variant — renders a mono command chip with a green check
      socket.on("sim:chat-end-command", (p: ChatEndCommandPayload) => {
        const message: WorkspaceMessage = {
          id: p.messageId,
          taskId: p.taskId,
          role: "assistant",
          kind: "command",
          content: p.content,
          command: p.command,
          diffAdd: 0,
          diffDel: 0,
          createdAt: new Date().toISOString(),
        };
        commitStreamed(p.taskId, message, p.tokensUsed);
      });

      // ---- task progress ----
      socket.on("sim:task-progress", (p: TaskProgressPayload) => {
        const patch: Partial<WorkspaceTask> = {
          stepCount: p.stepCount,
          tokensUsed: p.tokensUsed,
        };
        if (p.totalSteps) patch.totalSteps = p.totalSteps;
        actions().patchTask(p.taskId, patch);
        if (p.checklistDone && p.checklistDone.length) {
          actions().markChecklistDone(p.checklistDone);
        }
      });

      // ---- file change ----
      socket.on("sim:file-change", ({ taskId, file }: FileChangePayload) => {
        const s = useWorkspace.getState();
        // Only apply if this task is the active detail (otherwise it'd vanish).
        if (s.detail && s.detail.id === taskId) {
          s.addFileChange(file);
        }
      });

      // ---- new task ----
      socket.on("sim:new-task", ({ task }: NewTaskPayload) => {
        // Add to the list without hijacking the active task / detail, so the
        // user isn't yanked away from what they're viewing.
        actions().addTaskSilent(task);
      });

      // ---- upload ----
      socket.on("sim:upload", (p: UploadPayload) => {
        const s = useWorkspace.getState();
        const existing = s.uploads.find((u) => u.id === p.id);
        if (!existing) {
          const upload: Upload = {
            id: p.id,
            name: p.name,
            progress: p.progress,
            done: p.done,
          };
          s.addUpload(upload);
        } else {
          s.updateUpload(p.id, { progress: p.progress, done: p.done });
        }
        // Auto-remove completed uploads after a short delay so the panel breathes.
        if (p.done) {
          setTimeout(() => {
            useWorkspace.getState().removeUpload(p.id);
          }, 2500);
        }
      });
    });

    return () => {
      disposed = true;
      if (timeoutHandle) clearTimeout(timeoutHandle);
      socketRef.current?.disconnect();
      socketRef.current = null;
      actions().setSimStatus("disconnected");
    };
  }, []);

  const requestChat = (taskId: string, prompt: string) => {
    socketRef.current?.emit("sim:request-chat", { taskId, prompt });
  };
  const pause = () => {
    socketRef.current?.emit("sim:pause");
    actions().setSimPaused(true);
  };
  const resume = () => {
    socketRef.current?.emit("sim:start");
    actions().setSimPaused(false);
  };

  return { status, paused, requestChat, pause, resume };
}
