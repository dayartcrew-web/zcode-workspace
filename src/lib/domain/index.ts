/**
 * Barrel re-export for the pure domain-logic boundary.
 *
 * Import from `@/lib/domain` — e.g. `import { formatTokens } from "@/lib/domain"`.
 * Every module here must be pure (no React, no Prisma, no side effects).
 */
export * from "./format";
