import { createMiddleware } from "hono/factory";
import { createDbClient, type Db } from "@ureg/db";
import type { Env } from "./env.js";

export type Variables = { db: Db };

/** Bindings + request-scoped variables shared by every route in the app. */
export type AppEnv = { Bindings: Env; Variables: Variables };

/**
 * One database client per request, closed when the request ends.
 *
 * Workers cannot hold a connection pool across requests, so the client is
 * built from the Hyperdrive binding's connection string on each invocation and
 * released afterwards. Hyperdrive does the actual pooling in front of Postgres
 * (docs/plan.md §9). Handlers read it as `c.var.db` and must never build their
 * own client.
 */
export const withDb = createMiddleware<AppEnv>(async (c, next) => {
  const connectionString = c.env.HYPERDRIVE?.connectionString;
  if (!connectionString) throw new Error("HYPERDRIVE binding is not configured");

  const { db, close } = createDbClient(connectionString);
  c.set("db", db);
  try {
    await next();
  } finally {
    // `executionCtx` is absent outside a real request (unit tests via
    // app.request), so fall back to awaiting the close directly.
    try {
      c.executionCtx.waitUntil(close());
    } catch {
      await close();
    }
  }
});
