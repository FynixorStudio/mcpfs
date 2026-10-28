import pc from "picocolors";
import inquirer from "inquirer";
import { detect } from "../core/detect.js";
import { listMcp, removeMcp } from "../core/apply.js";

export async function runRemove(id?: string, opts: any = {}) {
  const det = await detect();
  const clients = det.clients.sort((a:any,b:any)=>(a.priority-b.priority)||a.name.localeCompare(b.name));

  let clientId = opts.to;
  if (!clientId) {
    const choices = clients.map((c:any)=>({name:`${c.name} ${pc.gray(`(${c.id})`)}`, value:c.id}));
    const ans = await inquirer.prompt([{type:"list", name:"clientId", message:"Pilih client", choices}]);
    clientId = ans.clientId;
  }

  const list = await listMcp(clientId);
  const servers = list.servers || {};
  const keys = Object.keys(servers);
  if (keys.length === 0) {
    console.log(pc.yellow("Tidak ada MCP terdaftar di client ini"));
    return;
  }

  let mcpId = id;
  if (!mcpId) {
    const choices = keys.map((k:string)=>({name:k, value:k}));
    const ans = await inquirer.prompt([{type:"list", name:"mcpId", message:"Pilih MCP yang mau dihapus", choices}]);
    mcpId = ans.mcpId;
  }

  try {
    const res = await removeMcp(clientId, mcpId, { dryRun: opts.dryRun });
    if (opts.dryRun) {
      console.log(pc.cyan(`\nmcpfs remove ${mcpId}`));
      console.log(`  ${pc.gray("~")} [dry-run] ${clientId} -> ${res.path}`);
    } else {
      console.log(pc.cyan(`\nmcpfs remove ${mcpId}`));
      console.log(`  ${pc.green("✓")} removed from ${clientId} -> ${res.path}`);
    }
  } catch (e:any) {
    console.log(pc.red("Error:"), e.message);
  }
}
