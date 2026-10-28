import os from "node:os";
import path from "node:path";

export function expandHome(p: string): string {
  if (!p) return p;
  if (p.startsWith("~")) {
    return path.join(os.homedir(), p.slice(1));
  }
  return p;
}

export function expandEnv(p: string): string {
  if (!p) return p;
  let result = p;
  result = result.replace(/%([^%]+)%/g, (_, key) => process.env[key] || "");
  result = result.replace(/\$\{([^}]+)\}/g, (_, key) => process.env[key] || "");
  result = result.replace(/\$([A-Z_][A-Z0-9_]*)/gi, (m, key) => process.env[key] || m);
  return result;
}

export function resolvePath(p: string): string {
  return expandHome(expandEnv(p));
}
