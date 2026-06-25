import { AppError, toResponse } from "@/lib/errors";

export const dynamic = "force-dynamic";

// GET /api/tasks/[id] — full task detail (messages, file changes, checklist).
//
// The mock seed data was removed in the teardown, so no task detail is
// available yet. Wire this to a real data source (Prisma) to populate.
// Failures are mapped to a tagged AppError via `toResponse`, so the response
// JSON carries a `_tag` the client can switch on (NotFound → 404).
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return toResponse(AppError.notFound(`Task '${id}' not found`));
}
