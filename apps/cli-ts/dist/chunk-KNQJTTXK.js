// src/core/shared.ts
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
function getSharedDir() {
  const shared = path.resolve(__dirname, "../../../../shared");
  return shared;
}
async function loadMapping() {
  const p = path.join(getSharedDir(), "mapping.json");
  const raw = await fs.readFile(p, "utf-8");
  return JSON.parse(raw);
}
async function loadRegistry() {
  const p = path.join(getSharedDir(), "registry.json");
  const raw = await fs.readFile(p, "utf-8");
  return JSON.parse(raw);
}

export {
  getSharedDir,
  loadMapping,
  loadRegistry
};
