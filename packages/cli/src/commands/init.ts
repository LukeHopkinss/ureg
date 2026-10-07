import { access, writeFile } from "node:fs/promises";

const TEMPLATE = `version: 1

automations:
  - id: example-job
    name: Example Job
    description: Describe what this automation does in plain language.
    owner: my-team
    schedule: "0 * * * *"
    environment: production
`;

export async function runInit(path: string) {
  const exists = await access(path).then(
    () => true,
    () => false,
  );
  if (exists) {
    console.error(`✗ ${path} already exists`);
    process.exitCode = 1;
    return;
  }
  await writeFile(path, TEMPLATE, "utf8");
  console.log(`✓ Created ${path}`);
}
