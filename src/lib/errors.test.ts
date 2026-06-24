import { describe, it, expect } from "vitest";
import { AppError, toHttpStatus, isNotFound, toResponse } from "@/lib/errors";
import type { AppErrorTag } from "@/lib/errors";

describe("AppError taxonomy (src/lib/errors)", () => {
  describe("constructors", () => {
    it("builds each variant with the right _tag", () => {
      expect(AppError.notFound("x")).toMatchObject({ _tag: "NotFound", message: "x" });
      expect(AppError.validation("y")).toMatchObject({ _tag: "Validation", message: "y" });
      expect(AppError.unauthorized()).toMatchObject({ _tag: "Unauthorized" });
      expect(AppError.conflict("z")).toMatchObject({ _tag: "Conflict", message: "z" });
      expect(AppError.internal()).toMatchObject({ _tag: "Internal" });
    });

    it("carries an optional cause", () => {
      const cause = new Error("root");
      expect(AppError.notFound("x", cause).cause).toBe(cause);
    });
  });

  describe("_tag discrimination → toHttpStatus", () => {
    // Explicit constructor map — type-safe (no dynamic indexing) and exhaustive.
    const cases: Array<{ tag: AppErrorTag; status: number; make: () => ReturnType<typeof AppError.notFound> }> = [
      { tag: "NotFound", status: 404, make: () => AppError.notFound("msg") },
      { tag: "Validation", status: 400, make: () => AppError.validation("msg") },
      { tag: "Unauthorized", status: 401, make: () => AppError.unauthorized() },
      { tag: "Conflict", status: 409, make: () => AppError.conflict("msg") },
      { tag: "Internal", status: 500, make: () => AppError.internal() },
    ];

    for (const { tag, status, make } of cases) {
      it(`maps ${tag} → ${status}`, () => {
        expect(toHttpStatus(make())).toBe(status);
      });
    }
  });

  describe("isNotFound guard", () => {
    it("narrows correctly", () => {
      expect(isNotFound(AppError.notFound(""))).toBe(true);
      expect(isNotFound(AppError.internal())).toBe(false);
    });
  });

  describe("toResponse", () => {
    it("returns a NextResponse with _tag + message + correct status", async () => {
      const res = toResponse(AppError.notFound("Task gone"));
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body).toMatchObject({ _tag: "NotFound", message: "Task gone" });
      expect(body).not.toHaveProperty("cause"); // internals not leaked
    });

    it("merges extra fields (e.g. zod issues)", async () => {
      const res = toResponse(AppError.validation("bad"), { issues: ["x"] });
      const body = await res.json();
      expect(body).toMatchObject({ _tag: "Validation", issues: ["x"] });
    });
  });
});
