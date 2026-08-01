import path from "node:path";
import { runWithFile, type OnChunk, type RunResult } from "./sandbox";

// Extra node args: when an egress proxy is configured, preload a module that
// reads HTTP(S)_PROXY and sets ccxt's httpsProxy/wssProxy so requests tunnel
// through the allowlist proxy (ccxt doesn't automatically honor proxy env vars).
function nodeProxyArgs(): string[] {
  const proxied =
    process.env.HTTPS_PROXY || process.env.https_proxy ||
    process.env.HTTP_PROXY || process.env.http_proxy;
  if (!proxied) return [];
  return ["--import", path.join(process.cwd(), "lib", "runners", "node-proxy-preload.mjs")];
}

// Node 23+ runs TypeScript natively — no tsc, no ts-node. The .mts extension
// forces ESM so `import ccxt from 'ccxt'` and top-level await work without a
// typeless-package.json warning. Types are erased, not checked (a playground
// wants fast feedback, not a full type-check gate).
//
// --experimental-transform-types instead of the default erasable-syntax-only
// stripping: without it, an `enum`/`namespace`/parameter property in a pasted
// snippet dies with ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX. It costs ~20ms/run and no
// dependency (tsx would be ~250ms and a native esbuild binary, and buys only
// decorators on top). The warning is disabled so it doesn't pollute stderr —
// which the playground surfaces as run output.
const TS_ARGS = ["--experimental-transform-types", "--disable-warning=ExperimentalWarning"];

export async function runTs(code: string, onChunk?: OnChunk): Promise<RunResult> {
  return runWithFile(code, "mts", (file) => ({
    cmd: process.execPath,
    args: [...nodeProxyArgs(), ...TS_ARGS, file],
    env: {
      NODE_PATH: path.join(process.cwd(), "node_modules"),
    },
  }), undefined, onChunk);
}
