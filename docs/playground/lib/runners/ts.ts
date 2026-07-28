import path from "node:path";
import { runWithFile, type OnChunk, type RunResult } from "./sandbox";
import { nodeProxyArgs } from "./js";

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
