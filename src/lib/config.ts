/**
 * Typed, validated environment configuration.
 *
 * Replaces ad-hoc `process.env.X` reads with a single validated `config`
 * object parsed through a zod schema. Unknown or invalid env fails fast at
 * module import with a clear error, so config problems surface at startup
 * rather than as silent `undefined`s deep in the app.
 *
 * Precedence: env vars > schema defaults. (No CLI layer in this template, so
 * the precedence chain is simpler than Synara's CLI>env>default.)
 *
 * Adapted from the Synara `Config.all({...})` pattern (pattern port to zod;
 * no code copied).
 *
 * NOTE on NEXT_PUBLIC_*: these are exposed to the browser by Next.js, so they
 * are safe to read on both client and server. Non-public vars (DATABASE_URL,
 * etc.) are server-only — importing `config` into client code will expose only
 * the fields Next inlines; treat secrets accordingly.
 */
import { z } from "zod";

const ConfigSchema = z.object({
  /** Runtime mode. */
  nodeEnv: z
    .enum(["development", "test", "production"])
    .default("development"),

  /** Next.js port (purely informational here; Next reads this itself). */
  port: z.coerce.number().int().positive().default(3000),

  /** Prisma SQLite database URL (server-only). */
  databaseUrl: z.string().min(1, "DATABASE_URL is required").default("file:./dev.db"),

  /* --- Simulation sidecar (NEXT_PUBLIC_* → client-exposed) --- */

  /** Port the mini-services sidecar listens on. */
  simPort: z.coerce.number().int().positive().default(4001),

  /** Optional explicit sidecar URL (overrides proxy/port logic). */
  nextPublicSimUrl: z.string().url().or(z.literal("")).default(""),

  /** Whether to route the sidecar through the Caddy proxy. */
  nextPublicSimProxy: z
    .string()
    .default("0")
    .transform((v) => v === "1"),
});

export type Config = z.infer<typeof ConfigSchema>;

/**
 * Parse an env record into a validated Config object.
 * Accepts a partial record of string values (e.g. process.env or a test env).
 * Exported so tests can parse an arbitrary env record.
 */
export function parseConfig(
  env: Record<string, string | undefined> = process.env,
): Config {
  const mapped = {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    databaseUrl: env.DATABASE_URL,
    simPort: env.SIM_PORT ?? env.NEXT_PUBLIC_SIM_PORT,
    nextPublicSimUrl: env.NEXT_PUBLIC_SIM_URL,
    nextPublicSimProxy: env.NEXT_PUBLIC_SIM_PROXY,
  };

  const result = ConfigSchema.safeParse(mapped);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return result.data;
}

/** The validated config for the current process.env. Read this in app code. */
export const config = parseConfig();
