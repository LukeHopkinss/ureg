import { readFile } from "node:fs/promises";
import { automationsFileSchema, type AutomationsFile } from "@ureg/shared";
import { parse } from "yaml";

export class ConfigError extends Error {
  constructor(
    message: string,
    readonly issues: string[] = [],
  ) {
    super(message);
  }
}

/** Parse and validate automations.yaml text. Structured data only — nothing is executed. */
export function parseAutomationsFile(text: string): AutomationsFile {
  let raw: unknown;
  try {
    raw = parse(text);
  } catch (err) {
    throw new ConfigError(`Invalid YAML: ${(err as Error).message}`);
  }
  const result = automationsFileSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join(".") || "<root>"}: ${i.message}`);
    throw new ConfigError("automations.yaml is invalid", issues);
  }
  return result.data;
}

export async function loadAutomationsFile(path: string): Promise<AutomationsFile> {
  return parseAutomationsFile(await readFile(path, "utf8"));
}
