#!/usr/bin/env node
import {
  loadMapping,
  loadRegistry
} from "./chunk-KNQJTTXK.js";

// src/cli.ts
import { Command } from "commander";
import pc6 from "picocolors";

// src/commands/detect.ts
import pc from "picocolors";

// src/core/detect.ts
import fs from "fs-extra";
import { execa } from "execa";

// src/utils/paths.ts
import os from "os";
import path from "path";
function expandHome(p) {
  if (!p) return p;
  if (p.startsWith("~")) {
    return path.join(os.homedir(), p.slice(1));
  }
  return p;
}
function expandEnv(p) {
  if (!p) return p;
  let result = p;
  result = result.replace(/%([^%]+)%/g, (_, key) => process.env[key] || "");
  result = result.replace(/\$\{([^}]+)\}/g, (_, key) => process.env[key] || "");
  result = result.replace(/\$([A-Z_][A-Z0-9_]*)/gi, (m, key) => process.env[key] || m);
  return result;
}
function resolvePath(p) {
  return expandHome(expandEnv(p));
}

// src/core/detect.ts
import os2 from "os";
import path2 from "path";
async function detect() {
  const mapping = await loadMapping();
  const platform = process.platform;
  const cwd = process.cwd();
  const clients = [];
  for (const [id, client] of Object.entries(mapping.clients)) {
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
        const rp = path2.resolve(cwd, pp);
        if (await fs.pathExists(rp)) foundPaths.push({ type: "project", path: rp });
      }
    }
    clients.push({
      id,
      name: client.name,
      type: client.type,
      key: client.key,
      priority: client.priority,
      found: foundPaths.length > 0,
      paths: foundPaths
    });
  }
  const runners = [];
  for (const [id, runner] of Object.entries(mapping.runners)) {
    let found = false;
    let details = [];
    for (const cand of runner.detect || []) {
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
        } catch {
        }
        if (platform === "win32") {
          try {
            await execa("where", [cand], { timeout: 1500 });
            found = true;
            details.push({ type: "bin", name: cand });
            continue;
          } catch {
          }
        } else {
          try {
            await execa("which", [cand], { timeout: 1500 });
            found = true;
            details.push({ type: "bin", name: cand });
            continue;
          } catch {
          }
        }
      }
    }
    runners.push({ id, name: runner.name, found, details });
  }
  return { clients, runners, platform, cwd, homedir: os2.homedir() };
}

// src/commands/detect.ts
async function runDetect() {
  const res = await detect();
  console.log(pc.cyan("mcpfs detect"));
  console.log(pc.gray(`platform: ${res.platform} | cwd: ${res.cwd}`));
  console.log("");
  console.log(pc.bold("Clients:"));
  for (const c of res.clients.sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name))) {
    if (c.found) {
      console.log(`  ${pc.green("\u2713")} ${c.name} ${pc.gray(`(${c.id})`)}`);
      for (const p of c.paths) {
        console.log(`      ${pc.gray(p.type + ":")} ${p.path}`);
      }
    } else {
      console.log(`  ${pc.gray("\u25CB")} ${pc.gray(c.name)} ${pc.gray(`(${c.id})`)}`);
    }
  }
  console.log("");
  console.log(pc.bold("Runners:"));
  for (const r of res.runners) {
    if (r.found) {
      console.log(`  ${pc.green("\u2713")} ${r.name} ${pc.gray(`(${r.id})`)}`);
      for (const d of r.details) {
        if (d.type === "bin") console.log(`      ${pc.gray("bin:")} ${d.name}`);
        if (d.type === "path") console.log(`      ${pc.gray("path:")} ${d.path}`);
      }
    } else {
      console.log(`  ${pc.gray("\u25CB")} ${pc.gray(r.name)} ${pc.gray(`(${r.id})`)}`);
    }
  }
  console.log("");
  console.log(pc.gray("Tip: run `mcpfs add` to add MCPs from curated registry"));
}

// src/commands/add.ts
import pc2 from "picocolors";
import inquirer from "inquirer";

// src/core/config.ts
import fs2 from "fs-extra";
import path3 from "path";
import { parse as parseToml, stringify as stringifyToml } from "smol-toml";
async function readJson(p) {
  if (!await fs2.pathExists(p)) return {};
  try {
    const raw = await fs2.readFile(p, "utf-8");
    if (!raw.trim()) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
async function writeJson(p, data) {
  await fs2.ensureDir(path3.dirname(p));
  await fs2.writeFile(p, JSON.stringify(data, null, 2) + "\n", "utf-8");
}
async function readToml(p) {
  if (!await fs2.pathExists(p)) return {};
  try {
    const raw = await fs2.readFile(p, "utf-8");
    if (!raw.trim()) return {};
    return parseToml(raw);
  } catch {
    return {};
  }
}
async function writeToml(p, data) {
  await fs2.ensureDir(path3.dirname(p));
  await fs2.writeFile(p, stringifyToml(data) + "\n", "utf-8");
}
function getClientConfigKey(client) {
  return client.key || "mcpServers";
}
async function getConfigPathForClient(clientId, prefer = "global", cwd = process.cwd()) {
  const mapping = await loadMapping();
  const client = mapping.clients[clientId];
  if (!client) return null;
  const platform = process.platform;
  if (prefer === "global") {
    if (client.paths.global) {
      if (Array.isArray(client.paths.global)) {
        for (const gp of client.paths.global) {
          const rp = resolvePath(gp);
          if (await fs2.pathExists(rp)) return rp;
        }
        return resolvePath(client.paths.global[0]);
      } else if (typeof client.paths.global === "object") {
        const gp = client.paths.global[platform];
        if (gp) return resolvePath(gp);
      }
    }
    if (client.paths.project) {
      if (Array.isArray(client.paths.project)) {
        return path3.resolve(cwd, client.paths.project[0]);
      }
    }
  } else {
    if (Array.isArray(client.paths.project)) {
      return path3.resolve(cwd, client.paths.project[0]);
    }
    if (client.paths.global) {
      if (Array.isArray(client.paths.global)) {
        return resolvePath(client.paths.global[0]);
      }
    }
  }
  return null;
}

// src/core/apply.ts
function buildServerDef(entry) {
  const def = {};
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
async function addMcp(clientId, mcpId, opts = {}) {
  const cwd = opts.cwd || process.cwd();
  const mapping = (await import("./shared-VC544KQZ.js")).loadMapping ? null : null;
  const { loadMapping: loadMapping2 } = await import("./shared-VC544KQZ.js");
  const mappingData = await loadMapping2();
  const client = mappingData.clients[clientId];
  if (!client) throw new Error(`Unknown client: ${clientId}`);
  const registry = await loadRegistry();
  const entry = registry.mcp.find((m) => m.id === mcpId);
  if (!entry) throw new Error(`Unknown mcp: ${mcpId}`);
  const key = getClientConfigKey(client);
  const cfgPath = await getConfigPathForClient(clientId, "project", cwd);
  const pathToUse = cfgPath || await getConfigPathForClient(clientId, "global", cwd);
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
async function removeMcp(clientId, mcpId, opts = {}) {
  const cwd = opts.cwd || process.cwd();
  const { loadMapping: loadMapping2 } = await import("./shared-VC544KQZ.js");
  const mappingData = await loadMapping2();
  const client = mappingData.clients[clientId];
  if (!client) throw new Error(`Unknown client: ${clientId}`);
  const key = getClientConfigKey(client);
  const pathToUse = await getConfigPathForClient(clientId, "project", cwd) || await getConfigPathForClient(clientId, "global", cwd);
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
async function listMcp(clientId, cwd = process.cwd()) {
  const { loadMapping: loadMapping2 } = await import("./shared-VC544KQZ.js");
  const mappingData = await loadMapping2();
  const client = mappingData.clients[clientId];
  if (!client) throw new Error(`Unknown client: ${clientId}`);
  const key = getClientConfigKey(client);
  const pathToUse = await getConfigPathForClient(clientId, "project", cwd) || await getConfigPathForClient(clientId, "global", cwd);
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

// src/commands/add.ts
async function runAdd(id, opts = {}) {
  const mapping = await loadMapping();
  const registry = await loadRegistry();
  const det = await detect();
  const foundClients = det.clients.filter((c) => c.found).map((c) => c.id);
  let mcpId = id;
  if (!mcpId) {
    const choices = registry.mcp.map((m) => ({
      name: `${m.name} ${pc2.gray(`(${m.id})`)} - ${m.description}`,
      value: m.id
    }));
    const ans = await inquirer.prompt([
      {
        type: "list",
        name: "mcpId",
        message: "Pilih MCP dari curated registry",
        choices
      }
    ]);
    mcpId = ans.mcpId;
  }
  let targets = opts.to;
  if (!targets || targets.length === 0) {
    const choices = det.clients.sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name)).map((c) => ({
      name: c.found ? `${c.name} ${pc2.green("(detected)")}` : `${c.name} ${pc2.gray("(not detected)")}`,
      value: c.id,
      checked: foundClients.includes(c.id)
    }));
    const ans = await inquirer.prompt([
      {
        type: "checkbox",
        name: "targets",
        message: "Pilih client tujuan (bisa lebih dari satu)",
        choices
      }
    ]);
    targets = ans.targets;
  }
  if (!targets || targets.length === 0) {
    console.log(pc2.yellow("Ga ada target yang dipilih"));
    return;
  }
  console.log(pc2.cyan(`
mcpfs add ${mcpId}`));
  for (const t of targets) {
    try {
      const res = await addMcp(t, mcpId, { dryRun: opts.dryRun });
      if (opts.dryRun) {
        console.log(`  ${pc2.gray("~")} [dry-run] ${t} -> ${res.path}`);
      } else {
        console.log(`  ${pc2.green("\u2713")} ${t} -> ${res.path}`);
      }
    } catch (e) {
      console.log(`  ${pc2.red("\u2717")} ${t}: ${e.message}`);
    }
  }
  if (!opts.dryRun) console.log(pc2.gray("\nDone."));
}

// src/commands/list.ts
import pc3 from "picocolors";
async function runList() {
  const det = await detect();
  console.log(pc3.cyan("mcpfs list"));
  for (const c of det.clients.sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name))) {
    const res = await listMcp(c.id);
    console.log(`
${pc3.bold(c.name)} ${pc3.gray(`(${c.id})`)}`);
    if (!res.path) {
      console.log(`  ${pc3.gray("no config path")}`);
      continue;
    }
    console.log(`  ${pc3.gray(res.path)}`);
    const servers = res.servers || {};
    const keys = Object.keys(servers);
    if (keys.length === 0) {
      console.log(`  ${pc3.gray("(empty)")}`);
      continue;
    }
    for (const k of keys) {
      console.log(`  ${pc3.green("\u2022")} ${k}`);
    }
  }
}

// src/commands/sync.ts
import pc4 from "picocolors";
import inquirer2 from "inquirer";
async function runSync(id, opts = {}) {
  const registry = await loadRegistry();
  const det = await detect();
  const found = det.clients.filter((c) => c.found);
  let mcpId = id;
  if (!mcpId) {
    const choices = registry.mcp.map((m) => ({ name: `${m.name} ${pc4.gray(`(${m.id})`)} - ${m.description}`, value: m.id }));
    const ans = await inquirer2.prompt([{ type: "list", name: "mcpId", message: "Sync MCP to all detected clients", choices }]);
    mcpId = ans.mcpId;
  }
  if (found.length === 0) {
    console.log(pc4.yellow("Ga ada client yang terdeteksi"));
    return;
  }
  console.log(pc4.cyan(`
mcpfs sync ${mcpId}`));
  for (const c of found.sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name))) {
    try {
      const res = await addMcp(c.id, mcpId, { dryRun: opts.dryRun });
      if (opts.dryRun) console.log(`  ${pc4.gray("~")} [dry-run] ${c.name} -> ${res.path}`);
      else console.log(`  ${pc4.green("\u2713")} ${c.name} -> ${res.path}`);
    } catch (e) {
      console.log(`  ${pc4.red("\u2717")} ${c.name}: ${e.message}`);
    }
  }
  if (!opts.dryRun) console.log(pc4.gray("\nDone."));
}

// src/commands/remove.ts
import pc5 from "picocolors";
import inquirer3 from "inquirer";
async function runRemove(id, opts = {}) {
  const det = await detect();
  const clients = det.clients.sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name));
  let clientId = opts.to;
  if (!clientId) {
    const choices = clients.map((c) => ({ name: `${c.name} ${pc5.gray(`(${c.id})`)}`, value: c.id }));
    const ans = await inquirer3.prompt([{ type: "list", name: "clientId", message: "Pilih client", choices }]);
    clientId = ans.clientId;
  }
  const list = await listMcp(clientId);
  const servers = list.servers || {};
  const keys = Object.keys(servers);
  if (keys.length === 0) {
    console.log(pc5.yellow("Tidak ada MCP terdaftar di client ini"));
    return;
  }
  let mcpId = id;
  if (!mcpId) {
    const choices = keys.map((k) => ({ name: k, value: k }));
    const ans = await inquirer3.prompt([{ type: "list", name: "mcpId", message: "Pilih MCP yang mau dihapus", choices }]);
    mcpId = ans.mcpId;
  }
  try {
    const res = await removeMcp(clientId, mcpId, { dryRun: opts.dryRun });
    if (opts.dryRun) {
      console.log(pc5.cyan(`
mcpfs remove ${mcpId}`));
      console.log(`  ${pc5.gray("~")} [dry-run] ${clientId} -> ${res.path}`);
    } else {
      console.log(pc5.cyan(`
mcpfs remove ${mcpId}`));
      console.log(`  ${pc5.green("\u2713")} removed from ${clientId} -> ${res.path}`);
    }
  } catch (e) {
    console.log(pc5.red("Error:"), e.message);
  }
}

// src/cli.ts
var program = new Command();
program.name("mcpfs").description("Manage MCP servers across AI clients & local runners").version("0.0.1");
program.command("detect").description("Detect available AI clients & local runners").action(async () => {
  try {
    await runDetect();
  } catch (e) {
    console.log(pc6.red("Error:"), e.message);
    process.exit(1);
  }
});
program.command("add").description("Add MCP from curated registry").argument("[id]", "MCP id from registry").option("-t, --to <clients...>", "Target clients").option("--dry-run", "Show changes without writing").action(async (id, opts) => {
  try {
    await runAdd(id, opts);
  } catch (e) {
    console.log(pc6.red("Error:"), e.message);
    process.exit(1);
  }
});
program.command("list").description("List MCPs per client").action(async () => {
  try {
    await runList();
  } catch (e) {
    console.log(pc6.red("Error:"), e.message);
    process.exit(1);
  }
});
program.command("sync").description("Sync MCP to multiple detected clients").argument("[id]", "MCP id").option("--dry-run", "Show changes without writing").action(async (id, opts) => {
  try {
    await runSync(id, opts);
  } catch (e) {
    console.log(pc6.red("Error:"), e.message);
    process.exit(1);
  }
});
program.command("remove").description("Remove MCP from a client").argument("[id]", "MCP id").option("-t, --to <client>", "Target client").option("--dry-run", "Show changes without writing").action(async (id, opts) => {
  try {
    await runRemove(id, opts);
  } catch (e) {
    console.log(pc6.red("Error:"), e.message);
    process.exit(1);
  }
});
program.parse();
