import fs from "fs-extra";
import path from "node:path";
import { loadMapping } from "./shared.js";
import { resolvePath } from "../utils/paths.js";
import { parse as parseToml, stringify as stringifyToml } from "smol-toml";

export async function readJson(p: string) {
  if (!(await fs.pathExists(p))) return {};
  try {
    const raw = await fs.readFile(p, "utf-8");
    if (!raw.trim()) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function writeJson(p: string, data: any) {
  await fs.ensureDir(path.dirname(p));
  await fs.writeFile(p, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

export async function readToml(p: string) {
  if (!(await fs.pathExists(p))) return {};
  try {
    const raw = await fs.readFile(p, "utf-8");
    if (!raw.trim()) return {};
    return parseToml(raw);
  } catch {
    return {};
  }
}

export async function writeToml(p: string, data: any) {
  await fs.ensureDir(path.dirname(p));
  await fs.writeFile(p, stringifyToml(data as any) + "\n", "utf-8");
}

export function getClientConfigKey(client: any) {
  return client.key || "mcpServers";
}

export async function getConfigPathForClient(clientId: string, prefer: "project" | "global" = "global", cwd = process.cwd()) {
  const mapping = await loadMapping();
  const client = (mapping.clients as any)[clientId];
  if (!client) return null;
  const platform = process.platform;
  if (prefer === "global") {
    if (client.paths.global) {
      if (Array.isArray(client.paths.global)) {
        for (const gp of client.paths.global) {
          const rp = resolvePath(gp);
          if (await fs.pathExists(rp)) return rp;
        }
        return resolvePath(client.paths.global[0]);
      } else if (typeof client.paths.global === "object") {
        const gp = client.paths.global[platform];
        if (gp) return resolvePath(gp);
      }
    }
    if (client.paths.project) {
      if (Array.isArray(client.paths.project)) {
        return path.resolve(cwd, client.paths.project[0]);
      }
    }
  } else {
    if (Array.isArray(client.paths.project)) {
      return path.resolve(cwd, client.paths.project[0]);
    }
    if (client.paths.global) {
      if (Array.isArray(client.paths.global)) {
        return resolvePath(client.paths.global[0]);
      }
    }
  }
  return null;
}
