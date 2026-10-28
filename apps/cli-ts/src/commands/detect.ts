import pc from "picocolors";
import { detect } from "../core/detect.js";

export async function runDetect() {
  const res = await detect();
  console.log(pc.cyan("mcpfs detect"));
  console.log(pc.gray(`platform: ${res.platform} | cwd: ${res.cwd}`));
  console.log("");
  console.log(pc.bold("Clients:"));
  for (const c of res.clients.sort((a: any,b:any)=>a.priority-b.priority || a.name.localeCompare(b.name))) {
    if (c.found) {
      console.log(`  ${pc.green("✓")} ${c.name} ${pc.gray(`(${c.id})`)}`);
      for (const p of c.paths) {
        console.log(`      ${pc.gray(p.type + ":")} ${p.path}`);
      }
    } else {
      console.log(`  ${pc.gray("○")} ${pc.gray(c.name)} ${pc.gray(`(${c.id})`)}`);
    }
  }
  console.log("");
  console.log(pc.bold("Runners:"));
  for (const r of res.runners) {
    if (r.found) {
      console.log(`  ${pc.green("✓")} ${r.name} ${pc.gray(`(${r.id})`)}`);
      for (const d of r.details) {
        if (d.type === "bin") console.log(`      ${pc.gray("bin:")} ${d.name}`);
        if (d.type === "path") console.log(`      ${pc.gray("path:")} ${d.path}`);
      }
    } else {
      console.log(`  ${pc.gray("○")} ${pc.gray(r.name)} ${pc.gray(`(${r.id})`)}`);
    }
  }
  console.log("");
  console.log(pc.gray("Tip: run `mcpfs add` to add MCPs from curated registry"));
}
