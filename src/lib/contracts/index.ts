/**
 * Contract boundary barrel.
 *
 * Import domain schemas/types from here:
 *   import { TaskSchema, type TaskT, CreateTaskInputSchema } from "@/lib/contracts";
 *
 * This is the single source of truth for shapes that cross the client↔server
 * boundary. Both Route Handlers (parse) and react-query/component call sites
 * (type) import from here — preventing drift.
 *
 * Adapted from the Synara `packages/contracts` pattern (pattern port; no code copied).
 */
export * from "./base-schemas";
export * from "./task";
