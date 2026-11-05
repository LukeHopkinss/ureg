import { spawnSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { dbTarget, describeTarget, requireDatabaseUrl } from "../env.js";

/**
 * Wrapper around `drizzle-kit migrate` that names the database it is about to
 * change before changing it, and refuses to touch production without an
 * explicit confirmation (docs/plan.md §9, §48).
 */

// `--production` is equivalent to UREG_DB_TARGET=production and avoids
// shell-specific inline env syntax in package.json.
if (process.argv.includes("--production")) process.env.UREG_DB_TARGET = "production";

const target = dbTarget();
const url = requireDatabaseUrl();
const where = describeTarget(url);

console.log(`Applying migrations to the ${target} database: ${where}`);

if (target === "production") {
  const expected = where.split(":")[0] ?? "";
  const given = process.env.UREG_DB_CONFIRM;

  if (given === undefined && process.stdin.isTTY) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const answer = await rl.question(`Type the host to confirm (${expected}): `);
    rl.close();
    if (answer.trim() !== expected) {
      console.error("Confirmation did not match. No migration was applied.");
      process.exit(1);
    }
  } else if (given !== expected) {
    console.error(
      `Refusing to migrate production without confirmation.\n` +
        `Re-run with UREG_DB_CONFIRM=${expected} (or run it interactively).`,
    );
    process.exit(1);
  }
}

const result = spawnSync("drizzle-kit", ["migrate"], {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: url },
});

process.exit(result.status ?? 1);
