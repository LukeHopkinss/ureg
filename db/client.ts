import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index.js";

/**
 * Create a Drizzle client plus the handle needed to release its connections.
 *
 * In production the Worker passes the Hyperdrive connection string; locally it
 * is a plain DATABASE_URL. Nothing here is Neon-specific (docs/plan.md §9, §35).
 *
 * On Workers a client is created per request and closed when the request ends,
 * so `close` must be called (via `waitUntil`) rather than left to GC.
 */
export function createDbClient(connectionString: string) {
  const sql = postgres(connectionString, { max: 5, fetch_types: false, prepare: false });
  return {
    db: drizzle(sql, { schema }),
    close: () => sql.end({ timeout: 5 }),
  };
}

export type Db = ReturnType<typeof createDbClient>["db"];

/** Client for long-lived contexts (scripts, tests) that manage their own teardown. */
export function createDb(connectionString: string): Db {
  return createDbClient(connectionString).db;
}
