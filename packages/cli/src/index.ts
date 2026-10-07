import { Command } from "commander";
import { registerCommands } from "./commands/index.js";

const program = new Command()
  .name("ureg")
  .description("A universal registry for everything your organization runs automatically.")
  .version("0.0.0");

registerCommands(program);

await program.parseAsync();
