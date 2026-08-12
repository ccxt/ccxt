import { NextResponse } from "next/server";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import ccxt from "ccxt";

export const runtime = "nodejs";

// Serves CCXT's base TypeScript declarations so the Monaco editor can offer
// IntelliSense (e.g. `exchange.` lists every unified method) for JS/TS — using
// Monaco's built-in TypeScript service, no language server required.
//
// Only the small, self-contained `js/src/base/**` tree is shipped (~110 KB);
// the 100+ per-exchange .d.ts files are skipped. A synthetic module entry types
// every exchange id as the base `Exchange` class, which carries all the unified
// methods (fetchTicker, createOrder, …) with their JSDoc.

const CCXT_ROOT = path.join(process.cwd(), "node_modules", "ccxt");
const BASE_DIR = path.join(CCXT_ROOT, "js", "src", "base");

type Lib = { uri: string; content: string };

async function collect(dir: string, libs: Lib[]) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await collect(full, libs);
    } else if (entry.name.endsWith(".d.ts")) {
      const rel = path.relative(CCXT_ROOT, full).split(path.sep).join("/");
      libs.push({ uri: `file:///node_modules/ccxt/${rel}`, content: await readFile(full, "utf8") });
    }
  }
}

function buildEntry(exchanges: string[], version: string): string {
  const ids = exchanges.map((id) => `  ${JSON.stringify(id)}: ExchangeClass;`).join("\n");
  return `export * from "./src/base/types.js";
export { Exchange } from "./src/base/Exchange.js";
import { Exchange } from "./src/base/Exchange.js";

type ExchangeClass = typeof Exchange;

export interface CcxtModule {
  Exchange: ExchangeClass;
  version: string;
  exchanges: readonly string[];
  pro: Record<string, ExchangeClass>;
${ids}
  [id: string]: any;
}

declare const ccxt: CcxtModule;
export default ccxt;
`;
}

let cache: { libs: Lib[]; entry: string; packageJson: string; version: string } | null = null;

export async function GET() {
  if (!cache) {
    const libs: Lib[] = [];
    await collect(BASE_DIR, libs);
    const version: string = (ccxt as unknown as { version: string }).version ?? "4.5.x";
    const exchanges: string[] = (ccxt as unknown as { exchanges: string[] }).exchanges ?? [];
    const packageJson = JSON.stringify({
      name: "ccxt",
      version,
      type: "module",
      types: "./js/ccxt.d.ts",
    });
    cache = { libs, entry: buildEntry(exchanges, version), packageJson, version };
  }
  return NextResponse.json(cache, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
