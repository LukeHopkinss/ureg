import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  boolean,
} from "drizzle-orm/pg-core";
import {
  automationStatus,
  desiredState,
  managedBy,
  observedState,
  sourceType,
  statusReason,
} from "./enums.js";
import { organizations } from "./organizations.js";

export const automations = pgTable(
  "automations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),

    stableKey: text("stable_key").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    businessNotes: text("business_notes"),

    ownerType: text("owner_type"),
    ownerValue: text("owner_value"),

    environment: text("environment"),

    sourceType: sourceType("source_type").notNull(),
    sourceExternalId: text("source_external_id"),

    scheduleType: text("schedule_type"),
    scheduleExpression: text("schedule_expression"),
    scheduleHuman: text("schedule_human"),
    graceIntervals: integer("grace_intervals").notNull().default(2),

    desiredState: desiredState("desired_state").notNull(),
    observedState: observedState("observed_state").notNull().default("unverifiable"),
    status: automationStatus("status").notNull().default("UNKNOWN"),
    statusReason: statusReason("status_reason").notNull().default("INSUFFICIENT_EVIDENCE"),

    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
    lastRunAt: timestamp("last_run_at", { withTimezone: true }),
    nextExpectedRunAt: timestamp("next_expected_run_at", { withTimezone: true }),
    lastEvaluatedAt: timestamp("last_evaluated_at", { withTimezone: true }),

    managedBy: managedBy("managed_by").notNull(),
    managementSourceId: text("management_source_id"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    removedAt: timestamp("removed_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("automations_org_stable_key_uq").on(t.organizationId, t.stableKey),
    index("automations_org_idx").on(t.organizationId),
    index("automations_org_status_idx").on(t.organizationId, t.status),
    index("automations_org_last_run_idx").on(t.organizationId, t.lastRunAt),
  ],
);

/** Append-only audit trail of observed state (docs/plan.md §11). */
export const automationObservations = pgTable(
  "automation_observations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    automationId: uuid("automation_id")
      .notNull()
      .references(() => automations.id),
    sourceType: sourceType("source_type").notNull(),
    sourceExternalId: text("source_external_id"),
    observedAt: timestamp("observed_at", { withTimezone: true }).notNull().defaultNow(),
    exists: boolean("exists").notNull(),
    metadataJson: jsonb("metadata_json"),
  },
  (t) => [index("automation_observations_automation_idx").on(t.automationId, t.observedAt.desc())],
);
