import { existsSync } from "node:fs";
import path from "node:path";
import { runWithFile, type RunResult } from "./sandbox";

// Prefer the provisioned venv (scripts/setup-runtimes.sh). Fall back to the
// system python3 with PYTHONPATH pointed at the monorepo's python/ source, which
// is importable as-is (verified: `PYTHONPATH=../python python3 -c "import ccxt"`).
function resolvePython(): { cmd: string; env?: Record<string, string> } {
  const venvPython = path.join(process.cwd(), "runtime", "python", ".venv", "bin", "python");
  if (existsSync(venvPython)) {
    return { cmd: venvPython };
  }
  const monorepoPython = path.join(process.cwd(), "..", "python");
  return {
    cmd: "python3",
    env: existsSync(monorepoPython) ? { PYTHONPATH: monorepoPython } : undefined,
  };
}

export async function runPython(code: string): Promise<RunResult> {
  const { cmd, env } = resolvePython();
  const result = await runWithFile(code, "py", (file) => ({
    cmd,
    args: [file],
    env: { PYTHONUNBUFFERED: "1", ...(env ?? {}) },
  }));
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
