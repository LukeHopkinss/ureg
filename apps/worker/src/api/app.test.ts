import { describe, expect, it, vi } from "vitest";
import { app } from "./app.js";

describe("api", () => {
  it("responds to health checks", async () => {
    const res = await app.request("/v1/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("returns JSON 404 for unknown routes", async () => {
    const res = await app.request("/v1/nope");
    expect(res.status).toBe(404);
  });

  it("reports an unreachable database without leaking details", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      // No HYPERDRIVE binding: stands in for any failure reaching Postgres.
      const res = await app.request("/v1/health/db", {}, {});
      expect(res.status).toBe(500);
      expect(await res.json()).toEqual({ error: { code: "INTERNAL" } });
    } finally {
      error.mockRestore();
    }
  });
});
