import { NextResponse } from "next/server";
import { seedTasks, buildTaskDetail } from "@/lib/seed-data";
import { AppError, toResponse } from "@/lib/errors";

export const dynamic = "force-dynamic";

// GET /api/tasks/[id] — full task detail (messages, file changes, checklist).
//
// Failures are mapped to tagged AppError variants and serialized via
// `toResponse`, so the response JSON carries a `_tag` the client can switch on
// (e.g. NotFound → 404 → "not found" toast). No bare `{ error }` here.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const task = seedTasks.find((t) => t.id === id);
  if (!task) {
    return toResponse(AppError.notFound(`Task '${id}' not found`));
  }
  return NextResponse.json({ detail: buildTaskDetail(task) });
}
