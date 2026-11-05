import { Hono } from "hono";
import { sql } from "drizzle-orm";
import type { AppEnv } from "../db.js";
import { withDb } from "../db.js";

export const healthRoutes = new Hono<AppEnv>();

/** Liveness: the Worker is running. Does not touch Postgres. */
healthRoutes.get("/", (c) => c.json({ ok: true }));

/**
 * Readiness: the Worker can reach Postgres through its database binding.
 *
 * Read-only and deliberately opaque — the response carries no connection
 * details and no raw database error, since this endpoint is unauthenticated
 * (docs/security.md).
 */
healthRoutes.get("/db", withDb, async (c) => {
  try {
    await c.var.db.execute(sql`select 1`);
    return c.json({ ok: true });
  } catch (error) {
    console.error(
      JSON.stringify({
        event: "health.db.failed",
        message: error instanceof Error ? error.message : String(error),
      }),
    );
    return c.json({ ok: false }, 503);
  }
});
