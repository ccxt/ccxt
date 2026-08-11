import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import {
  COMPILE_TIMEOUT_MS,
  RUNTIME_ROOT,
  runProcess,
  type OnChunk,
  type RunResult,
} from "./sandbox";

// C# is provisioned by scripts/setup-runtimes.sh: runtime/csharp/app is a console
// project referencing the ccxt NuGet package, restored once. Each run overwrites
// Program.cs (top-level statements) and `dotnet run --no-restore` recompiles just
// that file against the prebuilt ccxt.dll (~3-4s).
//
// `dotnet run` writes into the project's bin/obj, which isn't safe for concurrent
// invocations in the same directory, so runs are serialized through a promise
// chain. Fine for a single-host playground; a multi-tenant deploy would isolate
// per run (temp project) or containerize.
const APP_DIR = path.join(RUNTIME_ROOT, "csharp", "app");

let queue: Promise<unknown> = Promise.resolve();

function csEnv(): Record<string, string> {
  const env: Record<string, string> = {
    DOTNET_CLI_TELEMETRY_OPTOUT: "1",
    DOTNET_NOLOGO: "1",
    DOTNET_SKIP_FIRST_TIME_EXPERIENCE: "1",
  };
  // Forward the NuGet/dotnet locations the build used (set in the Docker image)
  // so `--no-restore` resolves ccxt.dll from the same cache. Unset locally → the
  // child falls back to dotnet's defaults, which is correct for a dev machine.
  for (const key of ["NUGET_PACKAGES", "DOTNET_CLI_HOME", "DOTNET_ROOT"]) {
    const value = process.env[key];
    if (value) env[key] = value;
  }
  return env;
}

export async function runCsharp(code: string, onChunk?: OnChunk): Promise<RunResult> {
  if (!existsSync(path.join(APP_DIR, "app.csproj"))) {
    return notProvisioned();
  }
  const run = async (): Promise<RunResult> => {
    await writeFile(path.join(APP_DIR, "Program.cs"), code, "utf8");
    return runProcess(
      { cmd: "dotnet", args: ["run", "--no-restore"], env: csEnv() },
      APP_DIR,
      COMPILE_TIMEOUT_MS,
      onChunk,
    );
  };
  const result = queue.then(run, run);
  // keep the chain alive but don't let a rejection poison the next run
  queue = result.catch(() => {});
  return result;
}

function notProvisioned(): RunResult {
  return {
    stdout: "",
    stderr:
      "C# runtime not provisioned. Run `npm run setup-runtimes` in the playground/ directory (needs the .NET SDK).",
    exitCode: null,
    durationMs: 0,
    timedOut: false,
    truncated: false,
  };
}
