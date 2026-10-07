import { describe, expect, it } from "vitest";
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
});
