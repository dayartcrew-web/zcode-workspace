/**
 * Typed API client helpers.
 *
 * These wrap raw `fetch` calls to the task endpoints and return values typed
 * from the contract schemas — so the client gets the SAME types the server
 * validated against. This is the client half of the no-drift contract boundary.
 *
 * Replace ad-hoc `fetch("/api/tasks")` + manual typing with these so call sites
 * stay in sync with the server automatically.
 */
import type { TaskT, TaskListResponseT } from "@/lib/contracts";

/**
 * Fetch the task list. Returns typed `TaskT[]`.
 * Throws on non-2xx (let react-query / callers handle via onError).
 */
export async function fetchTasks(signal?: AbortSignal): Promise<TaskT[]> {
  const res = await fetch("/api/tasks", { cache: "no-store", signal });
  if (!res.ok) {
    throw new Error(`Failed to fetch tasks: ${res.status}`);
  }
  const data = (await res.json()) as TaskListResponseT;
  return data.tasks;
}

/**
 * Fetch a single task's detail. (Shape is the richer TaskDetail; for now we
 * return the list-level TaskT from the tasks endpoint when looking up by id,
 * but the contract gate on the server guarantees the wire shape.)
 */
export async function fetchTask(
  id: TaskT["id"],
  signal?: AbortSignal,
): Promise<TaskT | undefined> {
  const tasks = await fetchTasks(signal);
  return tasks.find((t) => t.id === id);
}
