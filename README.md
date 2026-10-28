<div align="center">

<svg width="100%" height="120" viewBox="0 0 800 120" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#22d3ee;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#a78bfa;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#34d399;stop-opacity:1" />
    </linearGradient>
  </defs>
  <text x="50%" y="65" font-family="Inter,Segoe UI,Arial" font-size="56" font-weight="800" text-anchor="middle" fill="url(#grad)">mcpfs</text>
  <text x="50%" y="95" font-family="Inter,Segoe UI,Arial" font-size="14" text-anchor="middle" fill="#9ca3af">MCP Config Manager • Sync • Distribute • Manage</text>
</svg>

<p align="center">
  <strong>Satu perintah. Sebarin MCP ke semua AI Client lu tanpa copy-paste manual.</strong>
</p>

<p align="center">
  <a href="#bahasa-indonesia">Bahasa Indonesia</a> •
  <a href="#english">English</a>
</p>

<p align="center">
  <a href="https://github.com/mcpfs/mcpfs/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-22d3ee.svg?style=for-the-badge" alt="License"></a>
  <a href="https://github.com/mcpfs/mcpfs"><img src="https://img.shields.io/badge/Author-mcpfs-a78bfa.svg?style=for-the-badge&logo=github&logoColor=white" alt="Author"></a>
  <a href="https://github.com/mcpfs/mcpfs"><img src="https://img.shields.io/badge/Repo-mcpfs/mcpfs-34d399.svg?style=for-the-badge&logo=git&logoColor=white" alt="Repo"></a>
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Go-1.23+-00ADD8.svg?style=for-the-badge&logo=go&logoColor=white" alt="Go">
  <img src="https://img.shields.io/badge/Platform-Windows%20%7C%20Linux%20%7C%20macOS-9ca3af.svg?style=for-the-badge" alt="Platform">
</p>

</div>

## Bahasa Indonesia

### Tentang mcpfs

**mcpfs** adalah CLI tool berbasis lokal yang berfungsi sebagai _MCP Config Manager_. Tujuannya simpel, mengatur dan menyebarkan konfigurasi MCP Server ke berbagai AI Client lu hanya dengan satu perintah.

Bukan MCP Server, bukan MCP Router. **mcpfs adalah distributor config**. Dia yang urus baca, gabung, sesuaikan format, lokasi file, dan _key_ yang beda-beda tiap client biar MCP lu langsung kebaca tanpa perlu edit manual satu per satu.

### Kenapa mcpfs?

Setiap AI Client punya cara sendiri buat nyimpen konfigurasi MCP. Ada yang pakai `mcpServers`, ada yang pakai `mcp_servers`, ada yang JSON, ada juga yang TOML. Ditambah lagi beda lokasi config antara project dan global.

Dengan `mcpfs`, lu cukup fokus milih MCP mana yang mau dipasang, dan kemana aja mau disebarin. Sisanya biar `mcpfs` yang urus.

### Perbedaan mcpfs vs MCP Router

| Aspek | **MCP Router / Aggregator** | **mcpfs** |
| :-- | :-- | :-- |
| **Tipe** | Runtime (harus tetap berjalan di background) | Setup-time (hanya dipakai pas mau nambah, hapus, sync) |
| **Cara Kerja** | Mengarahkan semua client ke 1 proxy, lalu proxy yang nerusin ke MCP server masing-masing | Mengedit langsung file config tiap client (`.mcp.json`, `opencode.json`, `config.toml`, dll) |
| **Fokus** | Menggabungkan banyak MCP jadi 1 pintu | Menyebarkan konfigurasi MCP ke banyak client dengan cepat |
| **Beban** | Ada proses tambahan yang harus tetap _running_ | Ringan, tanpa proses latar belakang |
| **Kebebasan** | Biasanya semua client dapat daftar MCP yang sama | Bebas atur per client. Mau beda-beda juga bisa |
| **Kompatibilitas** | Tergantung dukungan proxy di client | Lebih native, langsung baca config lokal client |

> Bisa dipake barengan kok. Misal lu pake router buat gabung MCP internal, terus `mcpfs` bisa sebarin config router itu ke semua AI client lu dalam 1 perintah.

### Fitur Utama

- **Auto Detect** - Otomatis deteksi AI Client & Local Runner yang ada di mesin lu
- **Curated Registry** - Daftar MCP yang udah disaring, siap dipasang langsung
- **Multi Target** - Bisa sebar ke satu, beberapa, atau semua client yang terdeteksi
- **Smart Sync** - `mcpfs sync` buat apply MCP yang sama ke seluruh client yang kebaca
- **List & Remove** - Lihat dan hapus MCP dengan gampang per client
- **JSON & TOML Support** - Otomatis menyesuaikan format sesuai client tujuan
- **Dry Run** - Cek perubahan dulu sebelum benar-benar ditulis ke file config
- **Cross Platform** - Support Windows, Linux, dan macOS
- **Dua Varian** - Tersedia dalam bentuk Node.js + TypeScript maupun Go single binary

### Client & Runner yang Didukung

#### AI Clients

| Client | Status | Tipe Config |
| :-- | :--: | :-- |
| [Claude Code](https://docs.anthropic.com/claude/docs/claude-code) | `P0` | JSON (`mcpServers`) |
| [Cursor](https://www.cursor.com/) | `P0` | JSON (`mcpServers`) |
| [OpenCode](https://github.com/opencode-ai/opencode) | `P0` | JSON (`mcpServers`) |
| [Claude Desktop](https://claude.ai/download) | `P0` | JSON (`mcpServers`) |
| [Codex CLI](https://github.com/openai/codex-cli) | `P0` | TOML (`mcp_servers`) |
| [RooCode](https://github.com/RooCodeInc/RooCode) | `P1` | JSON (`mcpServers`) |
| [Cline](https://github.com/cline/cline) | `P1` | JSON (`mcpServers`) |
| [Continue.dev](https://www.continue.dev/) | `P1` | JSON (`mcpServers`) |

#### Local Runner (Auto-Detected)

| Runner | Status | Keterangan |
| :-- | :--: | :-- |
| [Ollama](https://ollama.com/) | `P0` | Auto-detect binary & direktori |
| [LMStudio](https://lmstudio.ai/) | `P0` | Auto-detect config/direktori |
| [llama-server](https://github.com/ggml-org/llama.cpp) | `P1` | Auto-detect binary di PATH |
| [Open WebUI](https://github.com/open-webui/open-webui) | `P1` | Auto-detect direktori konfigurasi |
| [SillyTavern](https://github.com/SillyTavern/SillyTavern) | `P1` | Auto-detect instalasi lokal |

### Curated Registry

mcpfs udah nyediain daftar MCP yang umum dipake buat langsung gas tanpa ribet nyari config manual.

| ID | Nama | Deskripsi |
| :-- | :-- | :-- |
| `filesystem` | Filesystem | Akses & kelola file/folder di workspace |
| `fetch` | Fetch | Biar agent bisa baca & ambil konten dari web |
| `git` | Git | Akses history, diff, status, branch & operasi git |
| `memory` | Memory | Knowledge graph biar agent bisa inget konteks jangka panjang |
| `sequential-thinking` | Sequential Thinking | Bantu agent mikirin step by step buat masalah kompleks |
| `time` | Time | Akses waktu & zona waktu lokal/target |

### Instalasi

#### Opsi 1: Node.js + TypeScript (npx friendly)

Cocok buat yang udah pasti ada Node.js di mesin.

```bash
npm i -g mcpfs
```

Atau langsung pake tanpa install global

```bash
npx mcpfs detect
```

#### Opsi 2: Go (Single Binary)

Cocok buat yang pengen 1 file executable, ringan & bisa dipake langsung.

**Via go install**

```bash
go install github.com/mcpfs/mcpfs/apps/cli-go@latest
```

**Build manual**

```bash
git clone https://github.com/mcpfs/mcpfs.git
cd mcpfs/apps/cli-go
go build -o mcpfs .
./mcpfs detect
```

### Cara Penggunaan

```bash
mcpfs detect
```

```bash
mcpfs add
```

```bash
mcpfs add filesystem
```

```bash
mcpfs add filesystem --to cursor,claude-code,opencode,codex-cli
```

```bash
mcpfs list
```

```bash
mcpfs sync filesystem
```

```bash
mcpfs remove filesystem --to cursor
```

```bash
mcpfs add git --dry-run
```

### Struktur Project

```text
mcpfs/
├── shared/        # mapping.json, registry.json, schema.json (dipake bareng oleh kedua varian)
├── apps/
│   ├── cli-ts/    # Implementasi Node.js + TypeScript
│   └── cli-go/    # Implementasi Go (single binary)
├── LICENSE
├── README.md
└── package.json
```

### Lisensi

Distributed under the [MIT License](./LICENSE). Copyright (c) 2026 mcpfs

---

## English

### About mcpfs

**mcpfs** is a local-first CLI tool that acts as an _MCP Config Manager_. Its goal is simple: manage and distribute MCP server configurations to all of your AI clients with a single command.

It's not an MCP Server and it's not an MCP Router. **mcpfs is a config distributor**. It reads, merges, normalizes paths, adjusts file formats and maps the correct keys per client so your MCPs just work without editing multiple config files manually.

### Why mcpfs?

Every AI client stores MCP configurations differently. Some use `mcpServers`, others use `mcp_servers`. Some rely on JSON, while others use TOML. Locations also differ between global and project scope.

With `mcpfs`, you only need to pick which MCP to add and which clients to target. Let `mcpfs` handle the rest.

### mcpfs vs MCP Router

| Aspect | **MCP Router / Aggregator** | **mcpfs** |
| :-- | :-- | :-- |
| **Type** | Runtime (must stay running in background) | Setup-time (only used when adding/removing/syncing) |
| **Approach** | Routes all clients through a single proxy | Edits each client's config file directly (`.mcp.json`, `opencode.json`, `config.toml`, etc) |
| **Goal** | Collapse multiple MCPs into one unified endpoint | Distribute the same MCP setup to multiple clients at once |
| **Overhead** | Extra background process required | Zero background process, purely file-based |
| **Flexibility** | Usually applies the same set to every client | Fully flexible per client. Mix and match as you wish |
| **Compatibility** | Depends on proxy support per client | More native and stable by writing directly to each client's expected config |

> They can be used together. For example, use a router for internal MCPs, then use `mcpfs` to push that router config to all your AI clients in one go.

### Key Features

- **Auto Detection** - Detect installed AI clients and local runners automatically
- **Curated Registry** - Hand-picked, ready-to-use MCP servers
- **Multi Targeting** - Apply to a single client, multiple, or all detected ones
- **Smart Sync** - Push the same MCP to every detected client instantly
- **List & Remove** - View or remove MCPs with ease per client
- **JSON & TOML Support** - Auto-adjusts to each client's expected format
- **Dry Run** - Preview changes before writing anything
- **Cross Platform** - Works on Windows, Linux and macOS
- **Dual Variants** - Available as Node.js + TypeScript or a Go single binary

### Supported Clients & Runners

#### AI Clients

| Client | Status | Config Type |
| :-- | :--: | :-- |
| [Claude Code](https://docs.anthropic.com/claude/docs/claude-code) | `P0` | JSON (`mcpServers`) |
| [Cursor](https://www.cursor.com/) | `P0` | JSON (`mcpServers`) |
| [OpenCode](https://github.com/opencode-ai/opencode) | `P0` | JSON (`mcpServers`) |
| [Claude Desktop](https://claude.ai/download) | `P0` | JSON (`mcpServers`) |
| [Codex CLI](https://github.com/openai/codex-cli) | `P0` | TOML (`mcp_servers`) |
| [RooCode](https://github.com/RooCodeInc/RooCode) | `P1` | JSON (`mcpServers`) |
| [Cline](https://github.com/cline/cline) | `P1` | JSON (`mcpServers`) |
| [Continue.dev](https://www.continue.dev/) | `P1` | JSON (`mcpServers`) |

#### Local Runners (Auto-Detected)

| Runner | Status | Notes |
| :-- | :--: | :-- |
| [Ollama](https://ollama.com/) | `P0` | Detects binary & directories |
| [LMStudio](https://lmstudio.ai/) | `P0` | Detects app data/config paths |
| [llama-server](https://github.com/ggml-org/llama.cpp) | `P1` | Detects from `PATH` |
| [Open WebUI](https://github.com/open-webui/open-webui) | `P1` | Detects config directories |
| [SillyTavern](https://github.com/SillyTavern/SillyTavern) | `P1` | Detects local installation |

### Curated Registry

| ID | Name | Description |
| :-- | :-- | :-- |
| `filesystem` | Filesystem | Read/write and manage files & directories |
| `fetch` | Fetch | Fetch and read web content |
| `git` | Git | Inspect history, diffs, branches and git state |
| `memory` | Memory | Long-term memory via knowledge graph |
| `sequential-thinking` | Sequential Thinking | Structured step-by-step reasoning |
| `time` | Time | Get local/target timezone aware time info |

### Installation

#### Option 1: Node.js + TypeScript

```bash
npm i -g mcpfs
```

```bash
npx mcpfs detect
```

#### Option 2: Go (Single Binary)

```bash
go install github.com/mcpfs/mcpfs/apps/cli-go@latest
```

Or build from source:

```bash
git clone https://github.com/mcpfs/mcpfs.git
cd mcpfs/apps/cli-go
go build -o mcpfs .
./mcpfs detect
```

### Usage

```bash
mcpfs detect
mcpfs add
mcpfs add filesystem
mcpfs add filesystem --to cursor,claude-code,opencode,codex-cli
mcpfs list
mcpfs sync filesystem
mcpfs remove filesystem --to cursor
mcpfs add git --dry-run
```

### Project Structure

```text
mcpfs/
├── shared/        # Shared mapping.json, registry.json, schema.json
├── apps/
│   ├── cli-ts/    # Node.js + TypeScript implementation
│   └── cli-go/    # Go implementation
├── LICENSE
├── README.md
└── package.json
```

### License

This project is licensed under the [MIT License](./LICENSE). Copyright (c) 2026 mcpfs

<div align="center">

<svg width="100%" height="40" viewBox="0 0 800 40" xmlns="http://www.w3.org/2000/svg">
  <text x="50%" y="25" font-family="Inter,Segoe UI,Arial" font-size="12" text-anchor="middle" fill="#6b7280">Made with focus by mcpfs • https://github.com/mcpfs/mcpfs</text>
</svg>

</div>
