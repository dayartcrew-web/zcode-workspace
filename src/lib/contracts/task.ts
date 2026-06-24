/**
 * Task domain contracts.
 *
 * Mirrors the Task entity from `prisma/schema.prisma` and the `WorkspaceTask`
 * type in `src/lib/types.ts`, expressed as zod schemas. These are the single
 * source of truth for Task shapes on the wire: the `/api/tasks` Route Handlers
 * parse with them, and client call sites type from them.
 *
 * Status values match `TaskStatus` in types.ts and the `status` column in the
 * Task model (active | complete | archived).
 */
import { z } from "zod";
import {
  TaskId,
  boundedString,
  nonNegativeInt,
  positiveInt,
} from "./base-schemas";

export const TaskStatusSchema = z.enum(["active", "complete", "archived"]);
export type TaskStatusT = z.infer<typeof TaskStatusSchema>;

/**
 * A Task as it appears in list views (the `GET /api/tasks` response item).
 * Maps to the richer `WorkspaceTask` client type. IDs are branded.
 */
export const TaskSchema = z.object({
  id: TaskId,
  title: boundedString(200),
  tags: z.array(boundedString(50)).default([]),
  branch: boundedString(120).default("main"),
  project: boundedString(120).default(""),
  goal: boundedString(500).default(""),
  status: TaskStatusSchema.default("active"),
  model: boundedString(80).default("GLM-5.2"),
  tokensUsed: nonNegativeInt.default(0),
  stepCount: nonNegativeInt.default(0),
  totalSteps: positiveInt.default(5),
  duration: boundedString(20).default("0m"),
  createdAt: z.string().default(""),
  updatedAt: z.string().default(""),
});
export type TaskT = z.infer<typeof TaskSchema>;

/** Response envelope for `GET /api/tasks`. */
export const TaskListResponseSchema = z.object({
  tasks: z.array(TaskSchema),
});
export type TaskListResponseT = z.infer<typeof TaskListResponseSchema>;

/**
 * Input for creating a Task (`POST /api/tasks`). Only `title` is required;
 * everything else has a sensible default server-side. Bounded to prevent
 * oversized payloads.
 */
export const CreateTaskInputSchema = z.object({
  title: boundedString(200),
  tags: z.array(boundedString(50)).optional(),
  branch: boundedString(120).optional(),
  project: boundedString(120).optional(),
  goal: boundedString(500).optional(),
  model: boundedString(80).optional(),
});
export type CreateTaskInputT = z.infer<typeof CreateTaskInputSchema>;
