/**
 * Barrel re-export of seed/mock data, now that the data + state live in
 * per-feature modules under src/lib/features/. Existing imports from
 * "@/lib/seed-data" keep resolving unchanged.
 */

// Task seed + detail builder
export {
  seedTasks,
  seedTaskDetail,
  buildTaskDetail,
} from "@/lib/features/task-progress";

// Simulation content (shared with the websocket sidecar vocabulary)
export { SIM_ASSISTANT_LINES } from "@/lib/features/chat-streaming";
export {
  SIM_FILE_POOL,
  randomFileChange,
  randomFileUpdateMessage,
} from "@/lib/features/file-changes";
export {
  SIM_PORT,
  SIM_COMMANDS,
  resolveSimTarget,
  randomAssistantPlan,
  randomNewTask,
} from "@/lib/features/simulation";
