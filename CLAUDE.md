# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A lightweight HTTP reverse proxy that forwards requests to `https://claudible.io` while spoofing the `User-Agent` and `Host` headers. Built with Bun's native `Bun.serve()` API (no external dependencies). Runs in Docker via `oven/bun:1-alpine`.

## Files

- `proxy.mjs` — the entire proxy implementation (single file)
- `Dockerfile` — builds a minimal Alpine image, copies `proxy.mjs`, sets default env vars
- `docker-compose.yml` — runs the container with `restart: unless-stopped`, maps port 9999, passes `CLAUDE_CODE_VERSION` from host shell env

## Architecture

`proxy.mjs` handles every incoming request with a single `Bun.serve()` handler:

1. Reconstructs the target URL: `https://claudible.io` + original path + query string
2. Clones all client request headers, then overwrites:
   - `user-agent` → `claude-code/<CLAUDE_CODE_VERSION>`
   - `host` → `claudible.io`
3. Forwards the request upstream with `decompress: false` (prevents Bun from auto-decompressing the response body, so compressed responses pass through intact with their original `Content-Encoding` header)
4. On non-2xx: buffers and logs the error body, returns it with the upstream status
5. On success: streams the response body directly back to the client with all upstream headers preserved

## Running

```bash
# Local (requires Bun installed)
bun run proxy.mjs

# Docker
docker compose up --build

# Set Claude Code version dynamically before Docker build
export CLAUDE_CODE_VERSION=$(claude --version | awk '{print $NF}')
docker compose up --build
```

## Configuration

Environment variables (defaults in `Dockerfile` / `docker-compose.yml`):

| Variable | Default | Description |
|---|---|---|
| `PROXY_PORT` | `9999` | Port the proxy listens on |
| `CLAUDE_CODE_VERSION` | `1.0.57` | Version string injected into the `User-Agent` header |

## Key Design Decisions

- **`decompress: false`** — Bun's `fetch` auto-decompresses responses by default. Without this flag, the response body would be decompressed but `Content-Encoding` would still be forwarded, causing the client to attempt double-decompression. Setting `decompress: false` makes the proxy fully transparent for compression.
- **No dependency on `package.json`** — `proxy.mjs` uses only Bun built-ins and the global `fetch` API; nothing to install.
- **Header passthrough** — all client request headers are forwarded as-is except `user-agent` and `host`, which are overwritten.
