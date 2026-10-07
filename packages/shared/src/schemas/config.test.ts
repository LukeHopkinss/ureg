import { describe, expect, it } from "vitest";
import { automationsFileSchema } from "./config.js";

const valid = {
  version: 1,
  automations: [
    { id: "stripe-sync", name: "Stripe Customer Sync", schedule: "*/5 * * * *" },
    { id: "nightly-backup", name: "Nightly Backup", schedule: "0 2 * * *" },
  ],
};

describe("automationsFileSchema", () => {
  it("accepts a valid file", () => {
    expect(automationsFileSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects duplicate ids", () => {
    const result = automationsFileSchema.safeParse({
      version: 1,
      automations: [
        { id: "a", name: "A" },
        { id: "a", name: "A again" },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid cron syntax", () => {
    const result = automationsFileSchema.safeParse({
      version: 1,
      automations: [{ id: "a", name: "A", schedule: "every tuesday" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects unknown fields such as shell commands", () => {
    const result = automationsFileSchema.safeParse({
      version: 1,
      automations: [{ id: "a", name: "A", healthcheck: { command: "curl ..." } }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects ids that are not stable keys", () => {
    const result = automationsFileSchema.safeParse({
      version: 1,
      automations: [{ id: "Stripe Sync", name: "A" }],
    });
    expect(result.success).toBe(false);
  });
});
