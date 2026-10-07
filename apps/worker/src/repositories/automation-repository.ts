import { and, asc, eq, isNull } from "drizzle-orm";
import { schema, type Db } from "@ureg/db";

const { automations } = schema;

/**
 * All automation data access goes through here. Every method requires an
 * organizationId so cross-tenant reads are impossible by construction
 * (docs/plan.md §18).
 */
export function createAutomationRepository(db: Db) {
  return {
    list(organizationId: string, opts: { includeRemoved?: boolean } = {}) {
      return db
        .select()
        .from(automations)
        .where(
          and(
            eq(automations.organizationId, organizationId),
            opts.includeRemoved ? undefined : isNull(automations.removedAt),
          ),
        )
        .orderBy(asc(automations.name));
    },

    async getByStableKey(organizationId: string, stableKey: string) {
      const [row] = await db
        .select()
        .from(automations)
        .where(
          and(eq(automations.organizationId, organizationId), eq(automations.stableKey, stableKey)),
        )
        .limit(1);
      return row ?? null;
    },
  };
}

export type AutomationRepository = ReturnType<typeof createAutomationRepository>;
