import path from "node:path";
import { runWithFile, type OnChunk, type RunResult } from "./sandbox";

// Extra node args: when an egress proxy is configured, preload a module that
// points http/https globalAgent at it (ccxt-js uses node-fetch, which ignores
// proxy env vars).
function nodeProxyArgs(): string[] {
  const proxied =
    process.env.HTTPS_PROXY || process.env.https_proxy ||
    process.env.HTTP_PROXY || process.env.http_proxy;
  if (!proxied) return [];
  return ["--import", path.join(process.cwd(), "lib", "runners", "node-proxy-preload.mjs")];
}

// Node 23+ strips types and runs TypeScript natively — no tsc, no ts-node.
// The .mts extension forces ESM so `import ccxt from 'ccxt'` and top-level await
// work without a typeless-package.json warning. Types are erased, not checked
// (a playground wants fast feedback, not a full type-check gate).
export async function runTs(code: string, onChunk?: OnChunk): Promise<RunResult> {
  return runWithFile(code, "mts", (file) => ({
    cmd: process.execPath,
    args: [...nodeProxyArgs(), file],
    env: {
      NODE_PATH: path.join(process.cwd(), "node_modules"),
    },
  }), undefined, onChunk);
}
