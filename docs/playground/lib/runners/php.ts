import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { runWithFile, type OnChunk, type RunResult } from "./sandbox";

// Prefer the composer install (scripts/setup-runtimes.sh). Fall back to the
// monorepo's ccxt.php, which is itself the autoloader.
function resolveAutoload(): string | undefined {
  const vendorAutoload = path.join(process.cwd(), "runtime", "php", "vendor", "autoload.php");
  if (existsSync(vendorAutoload)) return vendorAutoload;
  const monorepoAutoload = path.join(process.cwd(), "..", "..", "ccxt.php");
  if (existsSync(monorepoAutoload)) return monorepoAutoload;
  return undefined;
}

// Snippets written outside the playground routinely open with
// `require 'ccxt.php';` or `require __DIR__ . '/vendor/autoload.php';`. Here ccxt
// is already loaded by auto_prepend_file, so those lines are redundant — but they
// are fatal, because the run directory is a throwaway temp dir and PHP resolves a
// relative require against it (include_path is '.:/usr/share/php'). Dropping
// delegating shims at the paths those requires actually resolve to makes the
// redundant line a no-op instead of an "unrunnable code" report. Re-entry is
// safe: ccxt.php returns early when PATH_TO_CCXT is defined and composer's
// autoload_real caches its loader, so nothing is declared or registered twice.
function writeAutoloadShims(dir: string, autoload: string): void {
  const target = autoload.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  // Plain require, not require_once: composer's autoload.php returns the
  // ClassLoader, and `$loader = require 'vendor/autoload.php';` expects it.
  const shim = `<?php return require '${target}';\n`;
  for (const rel of ["ccxt.php", "vendor/autoload.php", "ccxt/ccxt.php"]) {
    const dest = path.join(dir, rel);
    mkdirSync(path.dirname(dest), { recursive: true });
    writeFileSync(dest, shim, "utf8");
  }
}

export async function runPhp(code: string, onChunk?: OnChunk): Promise<RunResult> {
  const autoload = resolveAutoload();
  // Raise memory_limit above PHP-CLI's 128M default: loadMarkets on large
  // exchanges (e.g. binance exchangeInfo) parses a multi-MB JSON payload.
  // Silence E_DEPRECATED: library-level notices (e.g. curl_close on PHP 8.5)
  // the user can't act on, and which don't appear on ccxt's target PHP versions.
  const base = ["-d", "memory_limit=512M", "-d", "error_reporting=E_ALL & ~E_DEPRECATED"];
  return runWithFile(code, "php", (file) => {
    // The shims live in the same temp dir as the script, which runWithFile
    // removes after the run.
    if (autoload) writeAutoloadShims(path.dirname(file), autoload);
    return {
      cmd: "php",
      args: autoload ? [...base, "-d", `auto_prepend_file=${autoload}`, file] : [...base, file],
    };
  }, undefined, onChunk);
}
