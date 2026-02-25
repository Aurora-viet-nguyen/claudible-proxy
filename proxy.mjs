const TARGET = "https://claudible.io";
const PROXY_PORT = parseInt(process.env.PROXY_PORT || "9999");
const CLAUDE_CODE_VERSION = process.env.CLAUDE_CODE_VERSION || "1.0.57";

console.log(`🚀 Claudible proxy starting on port ${PROXY_PORT}`);
console.log(`🎯 Target: ${TARGET}`);
console.log(`🤖 Spoofing User-Agent: claude-code/${CLAUDE_CODE_VERSION}`);

Bun.serve({
  port: PROXY_PORT,
  hostname: "0.0.0.0",

  async fetch(req) {
    const url = new URL(req.url);
    const targetURL = `${TARGET}${url.pathname}${url.search}`;

    // Clone and override headers
    const headers = new Headers(req.headers);
    headers.set("user-agent", `claude-code/${CLAUDE_CODE_VERSION}`);
    headers.set("host", new URL(TARGET).hostname);

    console.log(`→ ${req.method} ${url.pathname}`);

    const upstream = await fetch(targetURL, {
      method: req.method,
      headers,
      body: req.body,
      decompress: false,
    });

    console.log(`← ${upstream.status} ${url.pathname}`);

    if (!upstream.ok) {
      const body = await upstream.text();
      console.log("← ERROR BODY:", body);
      return new Response(body, {
        status: upstream.status,
        headers: upstream.headers,
      });
    }

    // Stream response directly back to client
    return new Response(upstream.body, {
      status: upstream.status,
      headers: upstream.headers,
    });
  },
});

console.log(`✅ Proxy listening on http://0.0.0.0:${PROXY_PORT}`);
