import { existsSync, readFileSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  COMPILE_TIMEOUT_MS,
  RUNTIME_ROOT,
  runProcess,
  type OnChunk,
  type RunResult,
} from "./sandbox";

// Go is provisioned by scripts/setup-runtimes.sh: runtime/go is a module that
// requires the published ccxt package, with its module + build caches pre-warmed
// (a cold build of ccxt is ~45s; warm runs are ~2s because only the user's tiny
// main package recompiles). Each run gets its own package dir so concurrent runs
// don't collide.
const GO_ROOT = path.join(RUNTIME_ROOT, "go");

function goEnv(): Record<string, string> {
  return {
    GOCACHE: path.join(GO_ROOT, ".cache"),
    GOMODCACHE: path.join(GO_ROOT, ".modcache"),
    GOPATH: path.join(GO_ROOT, ".gopath"),
    GOTOOLCHAIN: "auto",
    // readonly + GOPROXY=off: a user import outside the warmed module graph
    // fails instantly with a clear error instead of stalling through the
    // egress proxy (module fetches are denied by the allowlist) until
    // COMPILE_TIMEOUT_MS kills the run.
    GOFLAGS: "-mod=readonly",
    GOPROXY: "off",
  };
}

function goBin(): string {
  const pin = path.join(GO_ROOT, ".gobin");
  if (existsSync(pin)) {
    const p = readFileSync(pin, "utf8").trim();
    if (p) return p;
  }
  return "go";
}

// Imports are restricted to the Go standard library and the warmed ccxt
// module. Anything else is either not in the module graph (GOPROXY=off makes
// it fail, but only after go resolves the graph) or — worse — IS in the cache
// as one of ccxt's transitive dependencies (go-ethereum, gnark-crypto,
// gorilla/websocket, …) and compiles from source: a cold multi-GB build that
// the run's cpu/memory caps exist to contain, not to invite. Rejecting up
// front gives a clear message at zero cost. `import "C"` (cgo) is blocked
// explicitly — it would hand user code a C compiler.
const ALLOWED_MODULE = "github.com/ccxt/ccxt/go/v4";

// The ccxt Go module has exactly these packages: the root (every exchange lives
// there as ccxt.NewBinance(...)), plus /pro and /prediction. Snippets written
// against other language ports often assume a package per exchange
// ("…/go/v4/binance"), which is inside ALLOWED_MODULE and so passes the import
// filter, only to die at build time with "cannot find module providing package
// …: import lookup disabled by -mod=readonly" — accurate but unactionable.
// Name the real import instead.
const MODULE_PACKAGES = new Set(["", "pro", "prediction"]);

function unknownCcxtSubpackages(paths: string[]): string[] {
  const bad = paths
    .filter((p) => p === ALLOWED_MODULE || p.startsWith(ALLOWED_MODULE + "/"))
    .filter((p) => !MODULE_PACKAGES.has(p.slice(ALLOWED_MODULE.length).replace(/^\//, "")));
  return [...new Set(bad)];
}

export function disallowedGoImports(code: string): string[] {
  return goImports(code).filter((p) => {
    if (p === "C") return true; // cgo
    if (p === ALLOWED_MODULE || p.startsWith(ALLOWED_MODULE + "/")) return false;
    // Stdlib packages have no dot in their first path segment ("fmt",
    // "net/http") — the same heuristic the go tool itself uses.
    return p.split("/")[0].includes(".");
  });
}

function goImports(code: string): string[] {
  const paths: string[] = [];
  // Single-line form: import "fmt" / import alias "path" / import _ "path"
  const single = /^\s*import\s+(?:[A-Za-z_.][\w.]*\s+)?"([^"]+)"/gm;
  // Block form: import ( ... ) — collect every quoted path inside.
  const block = /import\s*\(([^)]*)\)/gm;
  for (const m of code.matchAll(single)) paths.push(m[1]);
  for (const m of code.matchAll(block)) {
    for (const q of m[1].matchAll(/"([^"]+)"/g)) paths.push(q[1]);
  }
  return [...new Set(paths)];
}

export async function runGo(code: string, onChunk?: OnChunk): Promise<RunResult> {
  if (!existsSync(path.join(GO_ROOT, "go.mod"))) {
    return notProvisioned();
  }
  const imports = goImports(code);
  const bad = disallowedGoImports(code);
  if (bad.length > 0) {
    return earlyError(
      `import not allowed in the playground: ${bad.map((p) => `"${p}"`).join(", ")}\n` +
        `Only the Go standard library and ${ALLOWED_MODULE} (incl. /pro and /prediction) can be imported.`,
    );
  }
  const unknown = unknownCcxtSubpackages(imports);
  if (unknown.length > 0) {
    return earlyError(
      `no such package in the ccxt Go module: ${unknown.map((p) => `"${p}"`).join(", ")}\n` +
        `ccxt-go has no package per exchange — every exchange is in the module root.\n` +
        `Import ccxt "${ALLOWED_MODULE}" and construct with ccxt.NewBinance(nil) ` +
        `(ccxt "${ALLOWED_MODULE}/pro" for WebSockets, /prediction for prediction markets).`,
    );
  }
  const id = "run-" + Math.random().toString(36).slice(2);
  const dir = path.join(GO_ROOT, "runs", id);
  await mkdir(dir, { recursive: true });
  try {
    await writeFile(path.join(dir, "main.go"), code, "utf8");
    return await runProcess(
      { cmd: goBin(), args: ["run", `./runs/${id}`], env: goEnv() },
      GO_ROOT,
      COMPILE_TIMEOUT_MS,
      onChunk,
    );
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

function earlyError(stderr: string): RunResult {
  return { stdout: "", stderr, exitCode: null, durationMs: 0, timedOut: false, truncated: false };
}

function notProvisioned(): RunResult {
  return earlyError(
    "Go runtime not provisioned. Run `npm run setup-runtimes` in the playground/ directory (needs Go 1.24+).",
  );
}
