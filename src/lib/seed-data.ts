/**
 * Barrel re-export of seed/mock data. Existing imports from
 * "@/lib/seed-data" keep resolving unchanged.
 *
 * NOTE: the simulation sidecar exports were removed in teardown T2.
 */

// Task seed + detail builder
export {
  seedTasks,
  seedTaskDetail,
  buildTaskDetail,
} from "@/lib/features/task-progress";

// Simulation content (shared vocabulary)
export { SIM_ASSISTANT_LINES } from "@/lib/features/chat-streaming";
export {
  SIM_FILE_POOL,
  randomFileChange,
  randomFileUpdateMessage,
} from "@/lib/features/file-changes";
