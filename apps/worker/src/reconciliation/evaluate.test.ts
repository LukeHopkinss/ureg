import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate.js";

const now = new Date("2026-01-01T00:00:00Z");

describe("evaluate", () => {
  it("marks removed automations REMOVED regardless of other state", () => {
    expect(evaluate({ declared: true, observed: true, removed: true, now }).status).toBe("REMOVED");
  });

  it("marks declared-but-unobserved automations MISSING", () => {
    expect(evaluate({ declared: true, observed: false, removed: false, now })).toEqual({
      status: "MISSING",
      reason: "SOURCE_NOT_OBSERVED",
    });
  });

  it("marks observed-but-undeclared automations UNREGISTERED", () => {
    expect(evaluate({ declared: false, observed: true, removed: false, now }).status).toBe(
      "UNREGISTERED",
    );
  });

  it("never defaults to HEALTHY without evidence", () => {
    expect(evaluate({ declared: true, observed: true, removed: false, now }).status).toBe(
      "UNKNOWN",
    );
  });
});
