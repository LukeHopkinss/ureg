import { app } from "./api/app.js";
import type { Env } from "./env.js";
import { runScheduledReconciliation } from "./reconciliation/scheduled.js";

export default {
  fetch: app.fetch,

  async scheduled(controller, env, ctx) {
    ctx.waitUntil(runScheduledReconciliation(env, new Date(controller.scheduledTime)));
  },
} satisfies ExportedHandler<Env>;
