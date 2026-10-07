import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index.js";

/**
 * Create a Drizzle client from a standard PostgreSQL connection string.
 *
 * In production the Worker passes the Hyperdrive connection string; locally it
 * is a plain DATABASE_URL. Nothing here is Neon-specific (docs/plan.md §9, §35).
 */
export function createDb(connectionString: string) {
  const client = postgres(connectionString, { max: 5, fetch_types: false, prepare: false });
  return drizzle(client, { schema });
}

export type Db = ReturnType<typeof createDb>;
