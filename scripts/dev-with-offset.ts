/**
 * Dev runner with port-offset support.
 *
 * Reads DEV_PORT_OFFSET (numeric, default 0) and launches `next dev` and the
 * simulation sidecar on derived ports, so multiple dev instances / worktrees
 * can run side-by-side without port clashes.
 *
 *   DEV_PORT_OFFSET=0  -> next :3000  sim :4001   (default; behaves like `dev:sim`)
 *   DEV_PORT_OFFSET=1  -> next :3001  sim :4002
 *
 * Usage:  bun run dev:offset            (app + sim)
 *         DEV_PORT_OFFSET=2 bun run dev:offset
 *
 * Reimplemented in plain TS from the port-offset idea (Synara's dev-runner is
 * Effect-TS based; this is a lightweight plain equivalent — no new runtime dep).
 */

import { spawn } from "node:child_process";

const BASE_APP_PORT = 3000;
const BASE_SIM_PORT = 4001;
const SIM_CWD = "mini-services";

function resolveOffset(): number {
  const raw = process.env.DEV_PORT_OFFSET ?? "0";
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    console.warn(
      `[dev:offset] DEV_PORT_OFFSET="${raw}" is not a non-negative integer; falling back to 0.`,
    );
    return 0;
  }
  // Keep offsets within a sane window to avoid privileged/ephemeral ranges.
  if (parsed > 1000) {
    console.warn(
      `[dev:offset] DEV_PORT_OFFSET=${parsed} is large; clamping expectations (app port ${BASE_APP_PORT + parsed}).`,
    );
  }
  return parsed;
}

function main() {
  const offset = resolveOffset();
  const appPort = BASE_APP_PORT + offset;
  const simPort = BASE_SIM_PORT + offset;

  const label = offset === 0 ? "(default)" : `(offset ${offset})`;
  console.log(
    `[dev:offset] ${label} app -> http://localhost:${appPort} | sim -> ws://localhost:${simPort}`,
  );

  // Mirror the existing `dev:sim` shape: app in blue, sim in green, via concurrently.
  // We pass each command as a SINGLE argv element with shell:false so Node preserves
  // the boundaries (shell:true would re-split "next dev -p 3000" into separate tokens
  // and break concurrently's per-command parsing on Windows).
  const env = {
    ...process.env,
    SIM_PORT: String(simPort),
  };

  const concurrently = spawn(
    "bunx",
    [
      "concurrently",
      "-n",
      "app,sim",
      "-c",
      "blue,green",
      `next dev -p ${appPort}`,
      `bun --cwd ${SIM_CWD} run sim-server.ts`,
    ],
    { stdio: "inherit", env, shell: false },
  );

  concurrently.on("exit", (code) => {
    process.exit(code ?? 0);
  });

  for (const sig of ["SIGINT", "SIGTERM"] as const) {
    process.on(sig, () => {
      concurrently.kill(sig);
      process.exit(0);
    });
  }
}

main();
