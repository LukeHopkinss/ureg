import type { Command } from "commander";
import { ConfigError, loadAutomationsFile } from "../config/load.js";
import { runInit } from "./init.js";

const DEFAULT_FILE = "automations.yaml";

function notImplemented(name: string) {
  return () => {
    console.error(`ureg ${name}: not implemented yet`);
    process.exitCode = 1;
  };
}

async function validateOrExit(file: string) {
  try {
    return await loadAutomationsFile(file);
  } catch (err) {
    if (err instanceof ConfigError) {
      console.error(`✗ ${err.message}`);
      for (const issue of err.issues) console.error(`  - ${issue}`);
      process.exit(1);
    }
    throw err;
  }
}

export function registerCommands(program: Command) {
  program.command("login").description("Authenticate with UReg").action(notImplemented("login"));
  program
    .command("logout")
    .description("Revoke the current session")
    .action(notImplemented("logout"));

  program
    .command("init")
    .description(`Create a starter ${DEFAULT_FILE}`)
    .option("-f, --file <path>", "config file path", DEFAULT_FILE)
    .action(async (opts: { file: string }) => runInit(opts.file));

  program
    .command("validate")
    .description("Validate a config file locally")
    .option("-f, --file <path>", "config file path", DEFAULT_FILE)
    .action(async (opts: { file: string }) => {
      const config = await validateOrExit(opts.file);
      console.log(`✓ ${opts.file} is valid (${config.automations.length} automations)`);
    });

  program
    .command("diff")
    .description("Compare local desired state with the registry")
    .option("-f, --file <path>", "config file path", DEFAULT_FILE)
    .action(async (opts: { file: string }) => {
      await validateOrExit(opts.file);
      notImplemented("diff")();
    });

  program
    .command("apply")
    .description("Apply local desired state to the registry")
    .option("-f, --file <path>", "config file path", DEFAULT_FILE)
    .option("-y, --yes", "skip interactive confirmation (CI)")
    .action(async (opts: { file: string }) => {
      await validateOrExit(opts.file);
      notImplemented("apply")();
    });

  program.command("list").description("List automations").action(notImplemented("list"));
  program
    .command("get <automation-id>")
    .description("Show one automation")
    .action(notImplemented("get"));
  program
    .command("status")
    .description("Summarize registry health")
    .action(notImplemented("status"));
  program
    .command("remove <automation-id>")
    .description("Mark an automation as removed")
    .action(notImplemented("remove"));
}
