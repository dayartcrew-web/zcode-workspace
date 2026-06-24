import { NextResponse } from "next/server";
import { seedTasks } from "@/lib/seed-data";

export const dynamic = "force-static";

// GET /api/tasks — list of tasks for the left sidebar
export async function GET() {
  return NextResponse.json({ tasks: seedTasks });
}
