import { getConfigPathForClient, getClientConfigKey, readJson, writeJson, readToml, writeToml } from "./config.js";
import { loadRegistry } from "./shared.js";

function buildServerDef(entry: any) {
  const def: any = {};
  if (entry.type && entry.type !== "stdio") {
    def.type = entry.type;
  }
  if (entry.command) def.command = entry.command;
  if (entry.args) def.args = entry.args;
  if (entry.env) def.env = entry.env;
  if (entry.url) def.url = entry.url;
  if (entry.headers) def.headers = entry.headers;
  return def;
}

export async function addMcp(clientId: string, mcpId: string, opts: { dryRun?: boolean, cwd?: string } = {}) {
  const cwd = opts.cwd || process.cwd();
  const mapping = (await import("./shared.js")).loadMapping ? null : null;
  const { loadMapping } = await import("./shared.js");
  const mappingData = await loadMapping();
  const client = (mappingData.clients as any)[clientId];
  if (!client) throw new Error(`Unknown client: ${clientId}`);
  const registry = await loadRegistry();
  const entry = (registry.mcp as any[]).find((m: any) => m.id === mcpId);
  if (!entry) throw new Error(`Unknown mcp: ${mcpId}`);
  const key = getClientConfigKey(client);
  const cfgPath = await getConfigPathForClient(clientId, "project", cwd);
  const pathToUse = cfgPath || (await getConfigPathForClient(clientId, "global", cwd));
  if (!pathToUse) throw new Error(`No config path for ${clientId}`);

  if (client.type === "json") {
    const cfg = await readJson(pathToUse);
    if (!cfg[key] || typeof cfg[key] !== "object") cfg[key] = {};
    cfg[key][entry.id] = buildServerDef(entry);
    if (opts.dryRun) return { action: "add", clientId, mcpId, path: pathToUse, preview: cfg };
    await writeJson(pathToUse, cfg);
    return { action: "add", clientId, mcpId, path: pathToUse };
  } else if (client.type === "toml") {
    const cfg = await readToml(pathToUse);
    if (!cfg[key] || typeof cfg[key] !== "object") cfg[key] = {};
    cfg[key][entry.id] = buildServerDef(entry);
    if (opts.dryRun) return { action: "add", clientId, mcpId, path: pathToUse, preview: cfg };
    await writeToml(pathToUse, cfg);
    return { action: "add", clientId, mcpId, path: pathToUse };
  }
  throw new Error(`Unsupported type for ${clientId}`);
}

export async function removeMcp(clientId: string, mcpId: string, opts: { dryRun?: boolean, cwd?: string } = {}) {
  const cwd = opts.cwd || process.cwd();
  const { loadMapping } = await import("./shared.js");
  const mappingData = await loadMapping();
  const client = (mappingData.clients as any)[clientId];
  if (!client) throw new Error(`Unknown client: ${clientId}`);
  const key = getClientConfigKey(client);
  const pathToUse = (await getConfigPathForClient(clientId, "project", cwd)) || (await getConfigPathForClient(clientId, "global", cwd));
  if (!pathToUse) throw new Error(`No config path for ${clientId}`);

  if (client.type === "json") {
    const cfg = await readJson(pathToUse);
    if (cfg[key] && typeof cfg[key] === "object") {
      delete cfg[key][mcpId];
    }
    if (opts.dryRun) return { action: "remove", clientId, mcpId, path: pathToUse, preview: cfg };
    await writeJson(pathToUse, cfg);
    return { action: "remove", clientId, mcpId, path: pathToUse };
  } else if (client.type === "toml") {
    const cfg = await readToml(pathToUse);
    if (cfg[key] && typeof cfg[key] === "object") {
      delete cfg[key][mcpId];
    }
    if (opts.dryRun) return { action: "remove", clientId, mcpId, path: pathToUse, preview: cfg };
    await writeToml(pathToUse, cfg);
    return { action: "remove", clientId, mcpId, path: pathToUse };
  }
  throw new Error(`Unsupported type for ${clientId}`);
}

export async function listMcp(clientId: string, cwd = process.cwd()) {
  const { loadMapping } = await import("./shared.js");
  const mappingData = await loadMapping();
  const client = (mappingData.clients as any)[clientId];
  if (!client) throw new Error(`Unknown client: ${clientId}`);
  const key = getClientConfigKey(client);
  const pathToUse = (await getConfigPathForClient(clientId, "project", cwd)) || (await getConfigPathForClient(clientId, "global", cwd));
  if (!pathToUse) return { clientId, path: null, servers: {} };
  if (client.type === "json") {
    const cfg = await readJson(pathToUse);
    return { clientId, path: pathToUse, servers: cfg[key] || {} };
  } else if (client.type === "toml") {
    const cfg = await readToml(pathToUse);
    return { clientId, path: pathToUse, servers: cfg[key] || {} };
  }
  return { clientId, path: pathToUse, servers: {} };
}
