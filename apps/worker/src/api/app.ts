import { Hono } from "hono";
import type { AppEnv } from "../db.js";
import { automationsRoutes } from "./automations.js";
import { healthRoutes } from "./health.js";

export const app = new Hono<AppEnv>().basePath("/v1");

app.route("/health", healthRoutes);
app.route("/automations", automationsRoutes);

app.notFound((c) => c.json({ error: { code: "NOT_FOUND" } }, 404));

/**
 * Unexpected failures are logged server-side and answered with an opaque body.
 * Database errors in particular must never reach a client (docs/security.md).
 */
app.onError((error, c) => {
  console.error(
    JSON.stringify({
      event: "request.failed",
      path: c.req.path,
      message: error instanceof Error ? error.message : String(error),
    }),
  );
  return c.json({ error: { code: "INTERNAL" } }, 500);
});
