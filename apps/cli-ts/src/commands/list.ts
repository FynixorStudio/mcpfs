import pc from "picocolors";
import { detect } from "../core/detect.js";
import { listMcp } from "../core/apply.js";

export async function runList() {
  const det = await detect();
  console.log(pc.cyan("mcpfs list"));
  for (const c of det.clients.sort((a:any,b:any)=>(a.priority-b.priority)||a.name.localeCompare(b.name))) {
    const res = await listMcp(c.id);
    console.log(`\n${pc.bold(c.name)} ${pc.gray(`(${c.id})`)}`);
    if (!res.path) {
      console.log(`  ${pc.gray("no config path")}`);
      continue;
    }
    console.log(`  ${pc.gray(res.path)}`);
    const servers = res.servers || {};
    const keys = Object.keys(servers);
    if (keys.length === 0) {
      console.log(`  ${pc.gray("(empty)")}`);
      continue;
    }
    for (const k of keys) {
      console.log(`  ${pc.green("•")} ${k}`);
    }
  }
}
