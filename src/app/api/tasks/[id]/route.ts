import { NextResponse } from "next/server";
import { seedTasks, buildTaskDetail } from "@/lib/seed-data";

export const dynamic = "force-dynamic";

// GET /api/tasks/[id] — full task detail (messages, file changes, checklist)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const task = seedTasks.find((t) => t.id === id);
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
  return NextResponse.json({ detail: buildTaskDetail(task) });
}
