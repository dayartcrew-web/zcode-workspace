/**
 * Tagged error taxonomy.
 *
 * A discriminated-union `AppError` replaces ad-hoc `throw new Error(...)` and
 * bare `{ error: string }` responses in API handlers. Every API failure maps to
 * a tagged variant, so clients (react-query `onError`, toast UX) can switch on
 * the `_tag` for consistent handling.
 *
 * Adapted from Synara's `Schema.TaggedErrorClass` pattern (pattern port; no
 * code copied). The discriminated-union form is the plain-TS equivalent that
 * works without Effect.
 */
import { NextResponse } from "next/server";

export type AppErrorTag =
  | "NotFound"
  | "Validation"
  | "Unauthorized"
  | "Conflict"
  | "Internal";

export interface AppErrorShape {
  readonly _tag: AppErrorTag;
  readonly message: string;
  readonly cause?: unknown;
}

/** Discriminated union — `_tag` narrows to the variant. */
export type AppError = AppErrorShape;

/* ------------------------------ constructors ------------------------------ */
/**
 * Curried-style helper constructors keep call sites terse and consistent.
 *   throw AppError.notFound("Task not found");
 *   return AppError.conflict("Branch already exists");
 *
 * NOTE: these return the plain object. Use `toResponse()` to convert to a
 * NextResponse, or `toHttpStatus()` for the status code.
 */
export const AppError = {
  notFound: (message: string, cause?: unknown): AppError => ({
    _tag: "NotFound",
    message,
    cause,
  }),
  validation: (message: string, cause?: unknown): AppError => ({
    _tag: "Validation",
    message,
    cause,
  }),
  unauthorized: (message = "Unauthorized", cause?: unknown): AppError => ({
    _tag: "Unauthorized",
    message,
    cause,
  }),
  conflict: (message: string, cause?: unknown): AppError => ({
    _tag: "Conflict",
    message,
    cause,
  }),
  internal: (message = "Internal server error", cause?: unknown): AppError => ({
    _tag: "Internal",
    message,
    cause,
  }),
};

/** Map an AppError _tag → HTTP status code. */
export function toHttpStatus(err: AppError): number {
  switch (err._tag) {
    case "NotFound":
      return 404;
    case "Validation":
      return 400;
    case "Unauthorized":
      return 401;
    case "Conflict":
      return 409;
    case "Internal":
      return 500;
  }
}

/**
 * Convert an AppError into a NextResponse. The JSON body includes `_tag` and
 * `message` (and omits `cause` to avoid leaking internals), so clients can
 * switch on `_tag` in their error handler.
 *
 * Optionally pass extra fields to merge into the body (e.g. zod `issues`).
 */
export function toResponse(
  err: AppError,
  extra?: Record<string, unknown>,
): NextResponse {
  return NextResponse.json(
    { _tag: err._tag, message: err.message, ...extra },
    { status: toHttpStatus(err) },
  );
}

/** Narrowing type-guards (optional convenience). */
export const isNotFound = (e: AppError): e is AppError & { _tag: "NotFound" } =>
  e._tag === "NotFound";
