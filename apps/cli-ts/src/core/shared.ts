import fs from "fs-extra";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getSharedDir() {
  const shared = path.resolve(__dirname, "../../../../shared");
  return shared;
}

export async function loadMapping() {
  const p = path.join(getSharedDir(), "mapping.json");
  const raw = await fs.readFile(p, "utf-8");
  return JSON.parse(raw);
}

export async function loadRegistry() {
  const p = path.join(getSharedDir(), "registry.json");
  const raw = await fs.readFile(p, "utf-8");
  return JSON.parse(raw);
}
