import { existsSync } from "node:fs";
import path from "node:path";
import { runWithFile, type OnChunk, type RunResult } from "./sandbox";

// Prefer the provisioned venv (scripts/setup-runtimes.sh). Fall back to the
// system python3 with PYTHONPATH pointed at the monorepo's python/ source, which
// is importable as-is (verified: `PYTHONPATH=../../python python3 -c "import ccxt"`).
function resolvePython(): { cmd: string; env?: Record<string, string> } {
  const venvPython = path.join(process.cwd(), "runtime", "python", ".venv", "bin", "python");
  if (existsSync(venvPython)) {
    return { cmd: venvPython };
  }
  const monorepoPython = path.join(process.cwd(), "..", "..", "python");
  return {
    cmd: "python3",
    env: existsSync(monorepoPython) ? { PYTHONPATH: monorepoPython } : undefined,
  };
}

export async function runPython(code: string, onChunk?: OnChunk): Promise<RunResult> {
  const { cmd, env } = resolvePython();
  // When an egress proxy is configured, put our sitecustomize on PYTHONPATH so it
  // auto-points ccxt at the proxy (ccxt-python's session ignores proxy env vars).
  const proxied =
    process.env.HTTPS_PROXY || process.env.https_proxy ||
    process.env.HTTP_PROXY || process.env.http_proxy;
  const parts = [env?.PYTHONPATH, proxied ? path.join(process.cwd(), "lib", "runners", "pyproxy") : ""]
    .filter(Boolean);
  const pythonPath = parts.join(":");
  // Stream stdout as-is; strip the known import-time stderr noise per chunk so the
  // live view matches the filtered final result.
  const onStream: OnChunk | undefined = onChunk
    ? (stream, data) => {
        const out = stream === "stderr" ? stripImportNoise(data) : data;
        if (out) onChunk(stream, out);
      }
    : undefined;
  const result = await runWithFile(code, "py", (file) => ({
    cmd,
    args: [file],
    env: {
      PYTHONUNBUFFERED: "1",
      ...(env ?? {}),
      ...(pythonPath ? { PYTHONPATH: pythonPath } : {}),
    },
  }), undefined, onStream);
  return { ...result, stderr: stripImportNoise(result.stderr) };
}

// ccxt's vendored ecdsa/toolz ship versioneer _version.py that shells out to
// `git` at import time (printing a harmless "fatal:" when there's no work tree),
// and on hosts whose Python links LibreSSL, urllib3 prints a NotOpenSSLWarning.
// Both are import-time noise unrelated to user code — strip just these exact
// patterns so genuine errors still surface. (Neither appears in a clean
// OpenSSL/Docker deployment.)
function stripImportNoise(stderr: string): string {
  return stderr
    .split("\n")
    .filter((line) => {
      if (line === "fatal: this operation must be run in a work tree") return false;
      if (line.includes("NotOpenSSLWarning")) return false;
      if (line.trim() === "warnings.warn(") return false;
      return true;
    })
    .join("\n");
}
