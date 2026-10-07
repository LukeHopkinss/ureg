import { index, integer, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { automations } from "./automations.js";
import { executionStatus } from "./enums.js";
import { organizations } from "./organizations.js";

/**
 * Execution metadata only: status, timing, provider ID.
 * Never stdout/stderr, request bodies, or customer payloads (docs/plan.md §31).
 */
export const executions = pgTable(
  "executions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    automationId: uuid("automation_id")
      .notNull()
      .references(() => automations.id),

    externalExecutionId: text("external_execution_id"),

    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    finishedAt: timestamp("finished_at", { withTimezone: true }),

    status: executionStatus("status").notNull().default("started"),
    durationMs: integer("duration_ms"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("executions_automation_external_id_uq").on(t.automationId, t.externalExecutionId),
    index("executions_automation_started_idx").on(t.automationId, t.startedAt.desc()),
    index("executions_org_started_idx").on(t.organizationId, t.startedAt.desc()),
  ],
);
