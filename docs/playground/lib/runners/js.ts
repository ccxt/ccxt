import path from "node:path";
import { runWithFile, type OnChunk, type RunResult } from "./sandbox";

// Extra node args: when an egress proxy is configured, preload a module that
// points http/https globalAgent at it (ccxt-js uses node-fetch, which ignores
// proxy env vars). Shared by the JS and TS runners.
export function nodeProxyArgs(): string[] {
  const proxied =
    process.env.HTTPS_PROXY || process.env.https_proxy ||
    process.env.HTTP_PROXY || process.env.http_proxy;
  if (!proxied) return [];
  return ["--import", path.join(process.cwd(), "lib", "runners", "node-proxy-preload.mjs")];
}

// Runs as a Node ESM module. The temp file lives under playground/runtime/tmp/,
// so `import 'ccxt'` resolves against playground/node_modules. Top-level await
// is supported, so snippets don't need a main() wrapper.
export async function runJs(code: string, onChunk?: OnChunk): Promise<RunResult> {
  return runWithFile(code, "mjs", (file) => ({
    cmd: process.execPath, // the node binary running Next.js
    args: [...nodeProxyArgs(), file],
    env: {
      // Resolve bare specifiers (ccxt) from the playground install.
      NODE_PATH: path.join(process.cwd(), "node_modules"),
    },
  }), undefined, onChunk);
}
