import { describe, it, expect } from "vitest";

/**
 * Smoke test — proves the vitest runner is wired correctly:
 *  - vitest executes the file
 *  - the `@/` path alias resolves (imports a real source module)
 *  - `expect` assertions work
 *
 * This is intentionally minimal. Real domain tests live in src/lib/domain/.
 */
describe("vitest setup smoke test", () => {
  it("runs and asserts", () => {
    expect(1 + 1).toBe(2);
  });

  it("resolves the @/* path alias to src/*", async () => {
    // Importing a real utility module via the alias proves alias wiring.
    // utils.ts exports `cn` (the shadcn class-merge helper) — a safe, side-effect-free import.
    const mod = await import("@/lib/utils");
    expect(typeof mod).toBe("object");
  });
});
