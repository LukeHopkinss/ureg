import { Hono } from "hono";
import type { Env } from "../env.js";
import { automationsRoutes } from "./automations.js";

export const app = new Hono<{ Bindings: Env }>().basePath("/v1");

app.get("/health", (c) => c.json({ ok: true }));

app.route("/automations", automationsRoutes);

app.notFound((c) => c.json({ error: { code: "NOT_FOUND" } }, 404));
