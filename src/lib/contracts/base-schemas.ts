/**
 * Base schema primitives + branded IDs.
 *
 * This is the foundation of the contract boundary (`src/lib/contracts/`):
 * bounded, reusable building blocks that every domain schema composes. The
 * goal is a single source of truth for types that cross the client↔server
 * boundary, so the two cannot drift (the same zod schema validates a Route
 * Handler's input AND types a react-query call site).
 *
 * Adapted from the Synara `packages/contracts` pattern (pattern port to zod v4;
 * no code copied). Branded IDs use zod's `.brand()` to produce nominal types,
 * preventing string-id mixups (a TaskId can't be passed where a MessageId is
 * expected) while remaining plain strings on the wire.
 */
import { z } from "zod";

/* ----------------------------- bounded strings ---------------------------- */

/** A string that is trimmed and non-empty after trimming. */
export const trimmedNonEmptyString = z
  .string()
  .trim()
  .min(1, "must not be empty");

/**
 * A string with an explicit max length (default 255). Use for any user-supplied
 * text to bound input defensively. The max is a hard cap, not a UI hint.
 */
export const boundedString = (max = 255) =>
  trimmedNonEmptyString.max(max, `must be at most ${max} characters`);

/* ----------------------------- bounded numbers ---------------------------- */

/** A non-negative integer (0 included). */
export const nonNegativeInt = z.number().int().min(0);

/** A strictly positive integer (1+). */
export const positiveInt = z.number().int().min(1);

/** A 0–100 percentage (clamped integer). */
export const percent = z.number().int().min(0).max(100);

/* -------------------------------- branded IDs ------------------------------ */

/**
 * Factory for nominal branded IDs. Returns a zod schema that parses strings
 * into a branded type `z.branded<z.ZodString, Brand>`, so a `TaskId` and a
 * `MessageId` are distinct types even though both are strings on the wire.
 *
 * Usage:
 *   export const TaskId = makeEntityId("TaskId");
 *   const id = TaskId.parse("abc"); // type: string & z.BRAND<"TaskId">
 *
 * Adapted from Synara's `makeEntityId` (baseSchemas.ts:27-28) — reimplemented
 * for zod v4.
 */
export const makeEntityId = <Brand extends string>(brand: Brand) =>
  trimmedNonEmptyString.brand(brand);

/** Nominal IDs — pass these around instead of bare `string` where it matters. */
export const TaskId = makeEntityId("TaskId");
export const MessageId = makeEntityId("MessageId");
export const FileChangeId = makeEntityId("FileChangeId");
export const ChecklistItemId = makeEntityId("ChecklistItemId");

/* ------------------------------- type helpers ------------------------------ */

/** Inferred TS type for a branded ID. */
export type BrandedId<B extends string> = string & z.BRAND<B>;
export type TaskIdT = BrandedId<"TaskId">;
export type MessageIdT = BrandedId<"MessageId">;
