import { NextResponse } from "next/server";
import { seedTasks } from "@/lib/seed-data";
import {
  TaskListResponseSchema,
  CreateTaskInputSchema,
  type CreateTaskInputT,
  type TaskT,
} from "@/lib/contracts";

export const dynamic = "force-static";

/**
 * GET /api/tasks — list of tasks for the left sidebar.
 *
 * The response is validated through the `TaskListResponseSchema` contract so
 * the wire shape is guaranteed to match what the client expects (typed from the
 * same schema). Any drift between server data and client types surfaces here at
 * build/request time instead of at the UI.
 */
export async function GET() {
  const parsed = TaskListResponseSchema.safeParse({ tasks: seedTasks });
  if (!parsed.success) {
    // Should never happen for seed data, but the contract gate catches it.
    return NextResponse.json(
      { error: "Task list contract validation failed", issues: parsed.error.issues },
      { status: 500 },
    );
  }
  return NextResponse.json(parsed.data);
}

/**
 * POST /api/tasks — create a task.
 *
 * Request body is parsed through `CreateTaskInputSchema` (bounded input), so
 * oversized or malformed payloads are rejected with a 400 + the zod issues,
 * rather than reaching app logic. The handler is illustrative for this
 * template (no persistence) but demonstrates the contract-driven pattern.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = CreateTaskInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid task input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const input: CreateTaskInputT = parsed.data;
  const created: TaskT = {
    id: crypto.randomUUID() as TaskT["id"],
    title: input.title,
    tags: input.tags ?? [],
    branch: input.branch ?? "main",
    project: input.project ?? "",
    goal: input.goal ?? "",
    status: "active",
    model: input.model ?? "GLM-5.2",
    tokensUsed: 0,
    stepCount: 0,
    totalSteps: 5,
    duration: "0m",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json({ task: created }, { status: 201 });
}
