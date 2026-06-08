import { existsSync } from "node:fs";
import path from "node:path";
import { runWithFile, type OnChunk, type RunResult } from "./sandbox";

// Prefer the composer install (scripts/setup-runtimes.sh). Fall back to the
// monorepo's ccxt.php, which is itself the autoloader.
function resolveAutoload(): string | undefined {
  const vendorAutoload = path.join(process.cwd(), "runtime", "php", "vendor", "autoload.php");
  if (existsSync(vendorAutoload)) return vendorAutoload;
  const monorepoAutoload = path.join(process.cwd(), "..", "ccxt.php");
  if (existsSync(monorepoAutoload)) return monorepoAutoload;
  return undefined;
}

export async function runPhp(code: string, onChunk?: OnChunk): Promise<RunResult> {
  const autoload = resolveAutoload();
  // Raise memory_limit above PHP-CLI's 128M default: loadMarkets on large
  // exchanges (e.g. binance exchangeInfo) parses a multi-MB JSON payload.
  // Silence E_DEPRECATED: library-level notices (e.g. curl_close on PHP 8.5)
  // the user can't act on, and which don't appear on ccxt's target PHP versions.
  const base = ["-d", "memory_limit=512M", "-d", "error_reporting=E_ALL & ~E_DEPRECATED"];
  return runWithFile(code, "php", (file) => ({
    cmd: "php",
    args: autoload ? [...base, "-d", `auto_prepend_file=${autoload}`, file] : [...base, file],
  }), undefined, onChunk);
}
