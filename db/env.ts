import { existsSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export type DbTarget = "dev" | "production";

/**
 * Which database the current command targets. Defaults to `dev` so that no
 * command touches production unless an operator asks for it explicitly.
 */
export function dbTarget(): DbTarget {
  return process.env.UREG_DB_TARGET === "production" ? "production" : "dev";
}

/** Repo-root env file holding the connection string for a target. */
export function envFileFor(target: DbTarget): string {
  return resolve(repoRoot, target === "production" ? ".env.production" : ".env");
}

/**
 * Load the repo-root env file for the current target. Both files are gitignored.
 * A `DATABASE_URL` already exported in the shell wins, so one-off overrides and
 * CI (which has no env file) keep working.
 */
export function loadDbEnv(): void {
  const file = envFileFor(dbTarget());
  if (!existsSync(file)) return;
  const fromShell = process.env.DATABASE_URL;
  process.loadEnvFile(file);
  if (fromShell) process.env.DATABASE_URL = fromShell;
}

/**
 * Connection string for a command that actually talks to Postgres.
 *
 * This fails loudly on purpose. The previous config fell back to localhost,
 * so a missing env file looked like a successful migration against an empty
 * local database instead of an error.
 */
export function requireDatabaseUrl(): string {
  loadDbEnv();
  const url = process.env.DATABASE_URL;
  if (!url) {
    const target = dbTarget();
    const file = relative(repoRoot, envFileFor(target));
    throw new Error(
      `DATABASE_URL is not set for the "${target}" database.\n` +
        `Set it in ${file} (gitignored) or export it in your shell, then re-run.\n` +
        `For local Docker Postgres: postgres://ureg:ureg@localhost:5432/ureg`,
    );
  }
  return url;
}

/**
 * Host and database name only — safe to print. Never log the full URL; it
 * carries the password.
 */
export function describeTarget(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}:${parsed.port || "5432"}${parsed.pathname}`;
  } catch {
    return "<unparseable DATABASE_URL>";
  }
}
