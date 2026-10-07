import { index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { organizations } from "./organizations.js";

export const integrationConnections = pgTable(
  "integration_connections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    provider: text("provider").notNull(),
    externalAccountId: text("external_account_id"),
    /** Encrypted at rest; never returned by the API after creation. */
    encryptedCredentials: text("encrypted_credentials"),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
  },
  (t) => [index("integration_connections_org_provider_idx").on(t.organizationId, t.provider)],
);

export const integrationSyncRuns = pgTable("integration_sync_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  integrationConnectionId: uuid("integration_connection_id")
    .notNull()
    .references(() => integrationConnections.id),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  status: text("status").notNull(),
  recordsDiscovered: integer("records_discovered").notNull().default(0),
  errorCode: text("error_code"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
