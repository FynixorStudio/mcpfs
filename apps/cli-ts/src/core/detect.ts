import fs from "fs-extra";
import { execa } from "execa";
import { loadMapping } from "./shared.js";
import { resolvePath } from "../utils/paths.js";
import os from "node:os";
import path from "node:path";

export async function detect() {
  const mapping = await loadMapping();
  const platform = process.platform;
  const cwd = process.cwd();

  const clients = [];
  for (const [id, client] of Object.entries(mapping.clients as any)) {
    const foundPaths = [];
    if (client.paths.global) {
      if (Array.isArray(client.paths.global)) {
        for (const gp of client.paths.global) {
          const rp = resolvePath(gp);
          if (await fs.pathExists(rp)) foundPaths.push({ type: "global", path: rp });
        }
      } else if (typeof client.paths.global === "object") {
        const gp = client.paths.global[platform];
        if (gp) {
          const rp = resolvePath(gp);
          if (await fs.pathExists(rp)) foundPaths.push({ type: "global", path: rp });
        }
      }
    }
    if (Array.isArray(client.paths.project)) {
      for (const pp of client.paths.project) {
        const rp = path.resolve(cwd, pp);
        if (await fs.pathExists(rp)) foundPaths.push({ type: "project", path: rp });
      }
    }
    clients.push({
      id,
      name: (client as any).name,
      type: (client as any).type,
      key: (client as any).key,
      priority: (client as any).priority,
      found: foundPaths.length > 0,
      paths: foundPaths,
    });
  }

  const runners = [];
  for (const [id, runner] of Object.entries(mapping.runners as any)) {
    let found = false;
    let details: any[] = [];
    for (const cand of (runner as any).detect || []) {
      if (cand.includes("/") || cand.includes("\\") || cand.startsWith("~") || cand.includes("%")) {
        const rp = resolvePath(cand);
        if (await fs.pathExists(rp)) {
          found = true;
          details.push({ type: "path", path: rp });
          continue;
        }
      } else {
        try {
          await execa(cand, ["--version"], { timeout: 1500 });
          found = true;
          details.push({ type: "bin", name: cand });
          continue;
        } catch {}
        if (platform === "win32") {
          try {
            await execa("where", [cand], { timeout: 1500 });
            found = true;
            details.push({ type: "bin", name: cand });
            continue;
          } catch {}
        } else {
          try {
            await execa("which", [cand], { timeout: 1500 });
            found = true;
            details.push({ type: "bin", name: cand });
            continue;
          } catch {}
        }
      }
    }
    runners.push({ id, name: (runner as any).name, found, details });
  }

  return { clients, runners, platform, cwd, homedir: os.homedir() };
}
