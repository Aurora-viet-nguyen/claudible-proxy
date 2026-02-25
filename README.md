# claudible-proxy

A lightweight HTTP reverse proxy that forwards requests to [claudible.io](https://claudible.io) while spoofing the `User-Agent` header to `claude-code/<version>`. Built with Bun's native `Bun.serve()` API — no dependencies.

## Usage

### Local

```bash
bun run proxy.mjs
```

### Docker

```bash
docker compose up --build
```

### Set version from installed Claude Code

```bash
export CLAUDE_CODE_VERSION=$(claude --version | awk '{print $NF}')
docker compose up --build
```

## Configuration

| Variable | Default | Description |
|---|---|---|
| `PROXY_PORT` | `9999` | Port the proxy listens on |
| `CLAUDE_CODE_VERSION` | `1.0.57` | Version string injected into `User-Agent` |

## Pointing Claude Code at the proxy

Set the API base URL to the proxy in your Claude Code config:

```bash
ANTHROPIC_BASE_URL=http://localhost:9999
```
