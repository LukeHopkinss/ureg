import { Hono } from "hono";
import type { Env } from "../env.js";

/**
 * Automation registry routes (docs/plan.md §17). Implemented in Phase 1.
 *
 * Every handler must resolve the caller's organization from auth and pass it
 * to the repository layer — never query tenant data without org scope.
 */
export const automationsRoutes = new Hono<{ Bindings: Env }>();

const notImplemented = { error: { code: "NOT_IMPLEMENTED" } } as const;

automationsRoutes.get("/", (c) => c.json(notImplemented, 501));
automationsRoutes.get("/:id", (c) => c.json(notImplemented, 501));
automationsRoutes.post("/", (c) => c.json(notImplemented, 501));
automationsRoutes.patch("/:id", (c) => c.json(notImplemented, 501));
