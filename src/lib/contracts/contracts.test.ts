import { describe, it, expect } from "vitest";
import {
  TaskSchema,
  CreateTaskInputSchema,
  TaskListResponseSchema,
  TaskStatusSchema,
  TaskId,
  trimmedNonEmptyString,
  boundedString,
  nonNegativeInt,
  positiveInt,
} from "@/lib/contracts";

/**
 * Contract boundary tests — prove the zod schemas parse/validate as intended,
 * and that the branded IDs enforce nominal typing (compile-time + no-op at
 * runtime, but parse ensures they're non-empty strings).
 */
describe("contracts boundary (src/lib/contracts)", () => {
  describe("base-schemas", () => {
    it("trimmedNonEmptyString rejects blank/whitespace", () => {
      expect(trimmedNonEmptyString.safeParse("hello").success).toBe(true);
      expect(trimmedNonEmptyString.safeParse("   ").success).toBe(false);
      expect(trimmedNonEmptyString.safeParse("").success).toBe(false);
    });

    it("boundedString enforces a max length", () => {
      expect(boundedString(5).safeParse("hi").success).toBe(true);
      expect(boundedString(5).safeParse("abcdef").success).toBe(false);
    });

    it("nonNegativeInt / positiveInt bound as named", () => {
      expect(nonNegativeInt.safeParse(0).success).toBe(true);
      expect(nonNegativeInt.safeParse(-1).success).toBe(false);
      expect(positiveInt.safeParse(1).success).toBe(true);
      expect(positiveInt.safeParse(0).success).toBe(false);
    });

    it("TaskId parses a non-empty string (branded nominal)", () => {
      const id = TaskId.parse("task-123");
      expect(id).toBe("task-123");
      // nominal: the type is string & BRAND<"TaskId"> — runtime it's a string.
      expect(typeof id).toBe("string");
    });
  });

  describe("TaskSchema", () => {
    it("accepts a minimal task and fills defaults", () => {
      const result = TaskSchema.safeParse({
        id: "task-1",
        title: "Add keyboard shortcut",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("active");
        expect(result.data.model).toBe("GLM-5.2");
        expect(result.data.totalSteps).toBe(5);
        expect(result.data.tokensUsed).toBe(0);
      }
    });

    it("rejects an empty title", () => {
      expect(
        TaskSchema.safeParse({ id: "task-1", title: "" }).success,
      ).toBe(false);
    });

    it("rejects an unknown status", () => {
      expect(
        TaskSchema.safeParse({
          id: "task-1",
          title: "t",
          status: "paused",
        }).success,
      ).toBe(false);
    });
  });

  describe("TaskStatusSchema", () => {
    it("accepts the three valid statuses", () => {
      expect(TaskStatusSchema.safeParse("active").success).toBe(true);
      expect(TaskStatusSchema.safeParse("complete").success).toBe(true);
      expect(TaskStatusSchema.safeParse("archived").success).toBe(true);
    });
  });

  describe("CreateTaskInputSchema", () => {
    it("requires only a title", () => {
      expect(CreateTaskInputSchema.safeParse({ title: "New task" }).success).toBe(true);
    });

    it("rejects a missing/empty title", () => {
      expect(CreateTaskInputSchema.safeParse({}).success).toBe(false);
      expect(CreateTaskInputSchema.safeParse({ title: "" }).success).toBe(false);
    });

    it("rejects an oversized title (bounded input discipline)", () => {
      expect(
        CreateTaskInputSchema.safeParse({ title: "x".repeat(201) }).success,
      ).toBe(false);
    });
  });

  describe("TaskListResponseSchema", () => {
    it("validates the GET /api/tasks envelope", () => {
      const result = TaskListResponseSchema.safeParse({
        tasks: [
          { id: "t1", title: "Task one" },
          { id: "t2", title: "Task two", status: "complete" },
        ],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tasks).toHaveLength(2);
        expect(result.data.tasks[1]?.status).toBe("complete");
      }
    });
  });
});
