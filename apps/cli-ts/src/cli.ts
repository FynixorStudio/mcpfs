#!/usr/bin/env node
import { Command } from "commander";
import pc from "picocolors";
import { runDetect } from "./commands/detect.js";
import { runAdd } from "./commands/add.js";
import { runList } from "./commands/list.js";
import { runSync } from "./commands/sync.js";
import { runRemove } from "./commands/remove.js";

const program = new Command();

program
  .name("mcpfs")
  .description("Manage MCP servers across AI clients & local runners")
  .version("0.0.1");

program
  .command("detect")
  .description("Detect available AI clients & local runners")
  .action(async () => {
    try { await runDetect(); } catch (e:any) { console.log(pc.red("Error:"), e.message); process.exit(1); }
  });

program
  .command("add")
  .description("Add MCP from curated registry")
  .argument("[id]", "MCP id from registry")
  .option("-t, --to <clients...>", "Target clients")
  .option("--dry-run", "Show changes without writing")
  .action(async (id, opts) => {
    try { await runAdd(id, opts); } catch (e:any) { console.log(pc.red("Error:"), e.message); process.exit(1); }
  });

program
  .command("list")
  .description("List MCPs per client")
  .action(async () => {
    try { await runList(); } catch (e:any) { console.log(pc.red("Error:"), e.message); process.exit(1); }
  });

program
  .command("sync")
  .description("Sync MCP to multiple detected clients")
  .argument("[id]", "MCP id")
  .option("--dry-run", "Show changes without writing")
  .action(async (id, opts) => {
    try { await runSync(id, opts); } catch (e:any) { console.log(pc.red("Error:"), e.message); process.exit(1); }
  });

program
  .command("remove")
  .description("Remove MCP from a client")
  .argument("[id]", "MCP id")
  .option("-t, --to <client>", "Target client")
  .option("--dry-run", "Show changes without writing")
  .action(async (id, opts) => {
    try { await runRemove(id, opts); } catch (e:any) { console.log(pc.red("Error:"), e.message); process.exit(1); }
  });

program.parse();
