import path from "node:path";
import { runWithFile, type RunResult } from "./sandbox";

// Runs as a Node ESM module. The temp file lives under playground/runtime/tmp/,
// so `import 'ccxt'` resolves against playground/node_modules. Top-level await
// is supported, so snippets don't need a main() wrapper.
export async function runJs(code: string): Promise<RunResult> {
  return runWithFile(code, "mjs", (file) => ({
    cmd: process.execPath, // the node binary running Next.js
    args: [file],
    env: {
      // Resolve bare specifiers (ccxt) from the playground install.
      NODE_PATH: path.join(process.cwd(), "node_modules"),
    },
  }));
}
