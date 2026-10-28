import pc from "picocolors";
import inquirer from "inquirer";
import { loadRegistry } from "../core/shared.js";
import { loadMapping } from "../core/shared.js";
import { addMcp } from "../core/apply.js";
import { detect } from "../core/detect.js";

export async function runAdd(id?: string, opts: any = {}) {
  const mapping = await loadMapping();
  const registry = await loadRegistry();
  const det = await detect();
  const foundClients = det.clients.filter((c: any) => c.found).map((c: any) => c.id);

  let mcpId = id;
  if (!mcpId) {
    const choices = (registry.mcp as any[]).map((m: any) => ({
      name: `${m.name} ${pc.gray(`(${m.id})`)} - ${m.description}`,
      value: m.id,
    }));
    const ans = await inquirer.prompt([
      {
        type: "list",
        name: "mcpId",
        message: "Pilih MCP dari curated registry",
        choices,
      },
    ]);
    mcpId = ans.mcpId;
  }

  let targets = opts.to as string[] | undefined;
  if (!targets || targets.length === 0) {
    const choices = det.clients
      .sort((a: any, b: any) => (a.priority - b.priority) || a.name.localeCompare(b.name))
      .map((c: any) => ({
        name: c.found ? `${c.name} ${pc.green("(detected)")}` : `${c.name} ${pc.gray("(not detected)")}`,
        value: c.id,
        checked: foundClients.includes(c.id),
      }));
    const ans = await inquirer.prompt([
      {
        type: "checkbox",
        name: "targets",
        message: "Pilih client tujuan (bisa lebih dari satu)",
        choices,
      },
    ]);
    targets = ans.targets;
  }

  if (!targets || targets.length === 0) {
    console.log(pc.yellow("Ga ada target yang dipilih"));
    return;
  }

  console.log(pc.cyan(`\nmcpfs add ${mcpId}`));
  for (const t of targets) {
    try {
      const res = await addMcp(t, mcpId, { dryRun: opts.dryRun });
      if (opts.dryRun) {
        console.log(`  ${pc.gray("~")} [dry-run] ${t} -> ${res.path}`);
      } else {
        console.log(`  ${pc.green("✓")} ${t} -> ${res.path}`);
      }
    } catch (e: any) {
      console.log(`  ${pc.red("✗")} ${t}: ${e.message}`);
    }
  }
  if (!opts.dryRun) console.log(pc.gray("\nDone."));
}
