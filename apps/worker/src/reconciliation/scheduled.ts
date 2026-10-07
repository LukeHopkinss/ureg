import type { Env } from "../env.js";

/**
 * Cron Trigger entry point. Phase 4: select automations due for evaluation,
 * run `evaluate`, and persist only changed statuses.
 */
export async function runScheduledReconciliation(_env: Env, scheduledAt: Date): Promise<void> {
  console.log(JSON.stringify({ event: "reconcile.tick", scheduledAt: scheduledAt.toISOString() }));
}
