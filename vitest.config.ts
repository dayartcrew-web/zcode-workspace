import { defineConfig } from "vitest/config";
import path from "node:path";

/**
 * Vitest config.
 *
 * Mirrors the `@/*` -> `./src/*` path alias from tsconfig.json so tests import
 * via the same module specifiers as the application code. Tests run against TS
 * source directly (no build step).
 *
 * `environment: "jsdom"` so component/DOM tests resolve browser globals.
 *
 * NOTE: this is added here so the domain module's unit tests can run on this
 * branch independently of Tier 1.5; it is identical to the Tier 1.5 config and
 * will reconcile cleanly when both branches merge.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.{ts,tsx}", "src/**/__tests__/**/*.{ts,tsx}"],
    exclude: ["node_modules", ".next", "dist", ".masday/**", "mini-services/**", "examples/**"],
  },
});
