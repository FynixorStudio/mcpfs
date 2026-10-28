import pc from "picocolors";
import inquirer from "inquirer";
import { loadRegistry } from "../core/shared.js";
import { detect } from "../core/detect.js";
import { addMcp } from "../core/apply.js";

export async function runSync(id?: string, opts: any = {}) {
  const registry = await loadRegistry();
  const det = await detect();
  const found = det.clients.filter((c:any)=>c.found);

  let mcpId = id;
  if (!mcpId) {
    const choices = (registry.mcp as any[]).map((m:any)=>({name:`${m.name} ${pc.gray(`(${m.id})`)} - ${m.description}`, value:m.id}));
    const ans = await inquirer.prompt([{type:"list", name:"mcpId", message:"Sync MCP to all detected clients", choices}]);
    mcpId = ans.mcpId;
  }

  if (found.length === 0) {
    console.log(pc.yellow("Ga ada client yang terdeteksi"));
    return;
  }

  console.log(pc.cyan(`\nmcpfs sync ${mcpId}`));
  for (const c of found.sort((a:any,b:any)=>(a.priority-b.priority)||a.name.localeCompare(b.name))) {
    try {
      const res = await addMcp(c.id, mcpId, { dryRun: opts.dryRun });
      if (opts.dryRun) console.log(`  ${pc.gray("~")} [dry-run] ${c.name} -> ${res.path}`);
      else console.log(`  ${pc.green("✓")} ${c.name} -> ${res.path}`);
    } catch (e:any) {
      console.log(`  ${pc.red("✗")} ${c.name}: ${e.message}`);
    }
  }
  if (!opts.dryRun) console.log(pc.gray("\nDone."));
}
