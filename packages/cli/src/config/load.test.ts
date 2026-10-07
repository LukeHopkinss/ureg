import { describe, expect, it } from "vitest";
import { ConfigError, parseAutomationsFile } from "./load.js";

describe("parseAutomationsFile", () => {
  it("parses a valid file", () => {
    const file = parseAutomationsFile(`
version: 1
automations:
  - id: stripe-sync
    name: Stripe Customer Sync
    schedule: "*/5 * * * *"
`);
    expect(file.automations[0]?.id).toBe("stripe-sync");
  });

  it("reports validation issues with paths", () => {
    try {
      parseAutomationsFile(`
version: 1
automations:
  - id: a
    name: A
  - id: a
    name: B
`);
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(ConfigError);
      expect((err as ConfigError).issues).toEqual(['automations.1.id: duplicate id "a"']);
    }
  });

  it("rejects malformed YAML", () => {
    expect(() => parseAutomationsFile("version: [")).toThrow(ConfigError);
  });
});
