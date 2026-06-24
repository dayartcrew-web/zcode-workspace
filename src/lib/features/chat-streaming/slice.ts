import type { StateCreator } from "zustand";
import type { WorkspaceMessage } from "@/lib/types";
import type { WorkspaceState } from "@/lib/store";

export interface ChatStreamingSlice {
  /** Id of the assistant message currently streaming token-by-token (null = idle). */
  streamingMessageId: string | null;
  /** Partial content accumulated while streaming. */
  streamingContent: string;
  /** Begin streaming a new assistant message; the id is provided. */
  startStreaming: (messageId: string) => void;
  /** Append a token/word chunk to the in-flight streaming message. */
  appendStreamingToken: (token: string) => void;
  /** Finalize streaming: commit the message into detail.messages and clear state. */
  finishStreaming: (message: WorkspaceMessage) => void;
  /** Discard the in-flight stream without committing (e.g. on disconnect). */
  cancelStreaming: () => void;
}

export const createChatStreamingSlice: StateCreator<
  WorkspaceState,
  [],
  [],
  ChatStreamingSlice
> = (set) => ({
  streamingMessageId: null,
  streamingContent: "",

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

  cancelStreaming: () =>
    set({ streamingMessageId: null, streamingContent: "" }),
});
