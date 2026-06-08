// Preloaded (via `node --import`) before user JS/TS runs. ccxt-js uses node-fetch,
// which doesn't read proxy env vars — so we point http/https globalAgent at the
// egress proxy. Then every ccxt request (and any other http/https call) tunnels
// through the allowlist proxy. No-op when no proxy is configured (local dev).
import http from "node:http";
import https from "node:https";

const proxy =
  process.env.HTTPS_PROXY || process.env.https_proxy ||
  process.env.HTTP_PROXY || process.env.http_proxy;

if (proxy) {
  try {
    const { HttpsProxyAgent } = await import("https-proxy-agent");
    const { HttpProxyAgent } = await import("http-proxy-agent");
    https.globalAgent = new HttpsProxyAgent(proxy);
    http.globalAgent = new HttpProxyAgent(proxy);
  } catch {
    // agents unavailable — leave direct (the internal network still blocks egress)
  }
}
