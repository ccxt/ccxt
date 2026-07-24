// Sandboxed process execution shared by every language runner.
//
// Safety posture (see playground/README.md for the production hardening path):
//   - scrubbed env: child sees only PATH/HOME/LANG, never the server's secrets
//   - hard timeout: the whole process group is SIGKILLed after the timeout
//   - output cap: combined stdout+stderr is bounded to avoid runaway buffers
//   - temp cwd: each run gets a throwaway directory that is removed afterwards

import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import path from "node:path";

export const RUN_TIMEOUT_MS = Number(process.env.RUN_TIMEOUT_MS ?? 15000);
// Compiled languages (Go, C#) recompile the user's file each run, so they get a
// larger budget. Warm builds are ~2-4s; the headroom covers a cold cache.
export const COMPILE_TIMEOUT_MS = Number(process.env.COMPILE_TIMEOUT_MS ?? 90000);
const MAX_OUTPUT_BYTES = 256 * 1024;

// The playground tree root and the temp run directory beneath it. Temp dirs live
// here (not the OS tmpdir) so Node's ESM resolver can walk up to
// playground/node_modules and resolve `import 'ccxt'`.
export const PLAYGROUND_ROOT = process.cwd();
export const RUNTIME_ROOT = path.join(PLAYGROUND_ROOT, "runtime");
const RUN_ROOT = path.join(RUNTIME_ROOT, "tmp");

export type RunResult = {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  durationMs: number;
  timedOut: boolean;
  truncated: boolean;
};

export type SpawnSpec = {
  cmd: string;
  args: string[];
  // Extra env merged on top of the scrubbed base env.
  env?: Record<string, string>;
};

// Called with each stdout/stderr chunk as it is produced (for live streaming).
export type OnChunk = (stream: "stdout" | "stderr", data: string) => void;

export function baseEnv(): Record<string, string> {
  const env: Record<string, string> = {
    PATH: process.env.PATH ?? "/usr/bin:/bin:/usr/local/bin",
    HOME: process.env.HOME ?? "/tmp",
    LANG: "en_US.UTF-8",
  };
  // Forward egress-proxy settings into the (otherwise scrubbed) child env so runs
  // reach exchanges only via the allowlist proxy. Python(requests)/PHP(libcurl)/
  // Go(net-http)/C#(HttpClient) honor these automatically; the JS/TS runner also
  // wires node-fetch's agent to the proxy (see node-proxy-preload.mjs).
  for (const k of [
    "HTTP_PROXY", "HTTPS_PROXY", "http_proxy", "https_proxy",
    "ALL_PROXY", "all_proxy", "NO_PROXY", "no_proxy",
  ]) {
    const v = process.env[k];
    if (v) env[k] = v;
  }
  return env;
}

export async function runProcess(
  spec: SpawnSpec,
  cwd: string,
  timeoutMs: number = RUN_TIMEOUT_MS,
  onChunk?: OnChunk,
): Promise<RunResult> {
  const startedAt = Date.now();
  return await new Promise<RunResult>((resolve) => {
    const child = spawn(spec.cmd, spec.args, {
      cwd,
      env: { ...baseEnv(), ...(spec.env ?? {}) } as NodeJS.ProcessEnv,
      detached: true, // own process group, so we can kill the whole tree
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let bytes = 0;
    let truncated = false;
    let timedOut = false;
    let settled = false;

    const killGroup = (signal: NodeJS.Signals) => {
      if (child.pid === undefined) return;
      try {
        process.kill(-child.pid, signal);
      } catch {
        // group already gone
      }
    };

    const timer = setTimeout(() => {
      timedOut = true;
      killGroup("SIGKILL");
    }, timeoutMs);

    const append = (chunk: Buffer, sink: "out" | "err") => {
      if (truncated) return;
      bytes += chunk.length;
      if (bytes > MAX_OUTPUT_BYTES) {
        truncated = true;
        killGroup("SIGKILL");
        return;
      }
      const text = chunk.toString();
      if (sink === "out") stdout += text;
      else stderr += text;
      onChunk?.(sink === "out" ? "stdout" : "stderr", text);
    };

    child.stdout.on("data", (c: Buffer) => append(c, "out"));
    child.stderr.on("data", (c: Buffer) => append(c, "err"));

    const finish = (exitCode: number | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({
        stdout,
        stderr,
        exitCode,
        durationMs: Date.now() - startedAt,
        timedOut,
        truncated,
      });
    };

    child.on("error", (err) => {
      stderr += `\n[playground] failed to start process: ${err.message}`;
      finish(null);
    });
    child.on("close", (code) => finish(code));
  });
}

// Write `code` to a fresh temp dir under the playground tree, run, then clean up.
export async function runWithFile(
  code: string,
  ext: string,
  buildSpec: (file: string) => SpawnSpec,
  timeoutMs: number = RUN_TIMEOUT_MS,
  onChunk?: OnChunk,
): Promise<RunResult> {
  await mkdir(RUN_ROOT, { recursive: true });
  const dir = await mkdtemp(path.join(RUN_ROOT, "run-"));
  const file = path.join(dir, `script.${ext}`);
  try {
    await writeFile(file, code, "utf8");
    return await runProcess(buildSpec(file), dir, timeoutMs, onChunk);
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}
