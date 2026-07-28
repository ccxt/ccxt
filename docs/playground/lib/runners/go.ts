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
    GOFLAGS: "-mod=mod",
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

export async function runGo(code: string, onChunk?: OnChunk): Promise<RunResult> {
  if (!existsSync(path.join(GO_ROOT, "go.mod"))) {
    return notProvisioned();
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

function notProvisioned(): RunResult {
  return {
    stdout: "",
    stderr:
      "Go runtime not provisioned. Run `npm run setup-runtimes` in the playground/ directory (needs Go 1.24+).",
    exitCode: null,
    durationMs: 0,
    timedOut: false,
    truncated: false,
  };
}
