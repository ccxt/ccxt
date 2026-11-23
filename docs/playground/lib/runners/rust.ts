import { existsSync, readFileSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  COMPILE_TIMEOUT_MS,
  RUN_TIMEOUT_MS,
  RUNTIME_ROOT,
  runProcess,
  type OnChunk,
  type RunResult,
} from "./sandbox";

// Rust is provisioned by scripts/setup-runtimes.sh: runtime/rust is a cargo
// project depending on the published ccxt / ccxt-pro / ccxt-prediction crates
// (plus tokio, serde_json, futures), built ONCE so every dependency rlib sits
// in runtime/rust/target/debug/deps. The script records the exact rlib of
// each direct dependency in runtime/rust/externs.json.
//
// A run does NOT go through cargo. It invokes rustc on the user's main.rs with
// one `--extern name=<rlib>` per allowed crate and `-L dependency=<dir>`,
// the way Compiler Explorer links its prebuilt crates. That gives us:
//   - speed: only the user's single-file crate compiles (~1s incl. the link);
//     ccxt is never rebuilt or even re-checked (no cargo fingerprinting);
//   - concurrency: cargo takes an exclusive lock on its target dir, so
//     `cargo run` would serialize every run (like the C# queue). rustc writes
//     only to the run's own temp dir, so runs proceed in parallel;
//   - an import allowlist for free: only the crates passed via --extern exist.
//     `use reqwest::…` or `extern crate libc` fails with rustc's own
//     "unresolved import"/"can't find crate" error, at zero cost.
// rustc must be the very toolchain that built the rlibs (E0514 otherwise), so
// externs.json pins its absolute path — invoked directly, not via the rustup
// proxy, which would need RUSTUP_HOME in the scrubbed env.
const RUST_ROOT = path.join(RUNTIME_ROOT, "rust");
const MANIFEST = path.join(RUST_ROOT, "externs.json");

type Manifest = {
  rustc: string;
  edition: string;
  // Dirs holding the dependency rlibs, relative to RUST_ROOT: target/debug/deps,
  // or one target/debug/build/<pkg>/<hash>/out per crate under cargo's newer
  // build-dir layout.
  deps: string[];
  externs: Record<string, string>; // crate name -> rlib path relative to RUST_ROOT
  // Native search paths build scripts emitted (rustc-link-search). Those are
  // not recorded in the rlib, so cargo passes them on the final link — and so
  // must we.
  native: string[];
  // Venue ids compiled into ccxt/ccxt-pro and ccxt-prediction ("all" = every one).
  venues: string[] | "all";
  prediction: string[] | "all";
};

// Re-read per run (it's tiny), so re-provisioning never needs a server restart.
function loadManifest(): Manifest | null {
  if (!existsSync(MANIFEST)) return null;
  try {
    return JSON.parse(readFileSync(MANIFEST, "utf8")) as Manifest;
  } catch {
    return null;
  }
}

export function rustcArgs(manifest: Manifest, src: string, out: string): string[] {
  const args = [
    "--edition", manifest.edition,
    "--crate-type", "bin",
    "--crate-name", "main",
    // The user's crate is tiny; opt-level 0 keeps its compile fast. Optimizing
    // it would buy nothing: the hot paths live in the prebuilt rlibs (JSON,
    // TLS and hashing at opt-level 2; see setup-runtimes.sh for why the ccxt
    // crates themselves stay at 0).
    "-C", "opt-level=0",
    "-C", "debuginfo=0",
    // Linking is most of a run's build time (the binary pulls in the venues it
    // touches from the ccxt rlibs); skipping std's debuginfo shrinks that work.
    "-C", "strip=debuginfo",
  ];
  const deps = typeof manifest.deps === "string" ? [manifest.deps] : manifest.deps; // pre-list manifests
  for (const d of deps) args.push("-L", `dependency=${path.join(RUST_ROOT, d)}`);
  for (const p of manifest.native ?? []) args.push("-L", p);
  for (const [name, rlib] of Object.entries(manifest.externs)) {
    args.push("--extern", `${name}=${path.join(RUST_ROOT, rlib)}`);
  }
  args.push("-o", out, src);
  return args;
}

function rustEnv(): Record<string, string> {
  return {
    // The generated exchange code is deeply nested; tokio's worker threads use
    // std's default 2 MB stack, which some venues overflow. RUST_MIN_STACK sets
    // that default for every spawned thread (tokio doesn't pin its own).
    RUST_MIN_STACK: String(64 * 1024 * 1024),
  };
}

// ccxt-rust's transpiled core signals every exchange error by panicking; the
// typed layer catches it (catch_unwind) and hands back Err(ExchangeError). The
// default panic hook still prints each caught panic, so a handled BadSymbol
// shows up twice — once as a scary "thread 'main' panicked at …/ccxt-common…"
// and once as the program's own error. The ccxt docs tell users to silence the
// hook, but a blanket silence would also hide the user's own unwrap() panics.
//
// So the runner appends this module to main.rs (after the user's code, so
// rustc's line numbers are unchanged). A static constructor (.init_array on
// Linux, __mod_init_func on macOS) installs a hook before main that drops
// panics raised INSIDE the ccxt crates (their source lives under cargo's
// registry) and keeps the default output for everything else. The dropped message is recorded in the run dir: if a ccxt
// panic is ever NOT caught (untyped Core calls) and kills the process, the
// runner prints it so the run never dies silently.
const PANIC_FILE = ".ccxt-panic";
const SHIM = `

// ---- appended by the CCXT Playground runner (not part of your snippet) ----
#[doc(hidden)]
#[allow(dead_code, non_upper_case_globals)]
mod __ccxt_playground {
    // ELF (Linux, the Docker image) runs .init_array before main; Mach-O
    // (a macOS dev box) rejects that section name and uses __mod_init_func.
    #[used]
    #[cfg_attr(target_vendor = "apple", link_section = "__DATA,__mod_init_func")]
    #[cfg_attr(not(target_vendor = "apple"), link_section = ".init_array")]
    static __ccxt_playground_init: extern "C" fn() = init;

    extern "C" fn init() {
        let default_hook = std::panic::take_hook();
        std::panic::set_hook(Box::new(move |info| {
            let from_ccxt = info.location().map_or(false, |l| {
                let file = l.file();
                file.contains("/registry/src/") && file.contains("/ccxt")
            });
            if !from_ccxt {
                let _ = std::fs::remove_file("${PANIC_FILE}");
                return default_hook(info);
            }
            let payload = info.payload();
            let msg = payload.downcast_ref::<String>().map(String::as_str)
                .or_else(|| payload.downcast_ref::<&str>().copied())
                .unwrap_or("(non-string panic payload)");
            let _ = std::fs::write("${PANIC_FILE}", msg);
        }));
    }
}
`;

// Venue types follow the exchange id, capitalized: ccxt::Binance, ccxt_pro::Okx.
// When the runtime was built with a curated venue set (CCXT_RUST_VENUES), a
// snippet naming any other venue fails with rustc's bare "cannot find type" /
// "unresolved import" — explain that instead.
function missingVenueHint(stderr: string, manifest: Manifest): string {
  const named = new Set<string>();
  // rustc phrasings: "cannot find `Bitmart` in `ccxt`" (E0433), "cannot find
  // type `Bitmart` in crate `ccxt`" (older), "unresolved import `ccxt::Bitmart`" (E0432)
  const re = /cannot find (?:[\w ,]+ )?`([A-Z]\w*)` in (?:crate |module )?`(ccxt(?:_pro|_prediction)?)`|unresolved import `(ccxt(?:_pro|_prediction)?)::([A-Z]\w*)`/g;
  for (const m of stderr.matchAll(re)) {
    const ident = m[1] ?? m[4];
    const crate = m[2] ?? m[3];
    const list = crate === "ccxt_prediction" ? manifest.prediction : manifest.venues;
    if (list !== "all" && !list.includes(ident.toLowerCase())) named.add(ident);
  }
  if (named.size === 0) return "";
  const venues = manifest.venues === "all" ? "all" : manifest.venues.join(", ");
  const prediction = manifest.prediction === "all" ? "all" : manifest.prediction.join(", ");
  return (
    `\n[playground] ${[...named].join(", ")} is not compiled into the playground's Rust runtime.\n` +
    `Compiling every venue needs >14 GB per rustc, so it ships a curated set:\n` +
    `  ccxt / ccxt_pro:  ${venues}\n` +
    `  ccxt_prediction:  ${prediction}\n` +
    `Locally every venue is available: cargo add ccxt tokio --features tokio/full\n`
  );
}

export async function runRust(code: string, onChunk?: OnChunk): Promise<RunResult> {
  const manifest = loadManifest();
  if (!manifest) return notProvisioned();
  if (!/\bfn\s+main\s*\(/.test(code)) {
    return earlyError("Your code must define a `fn main()` (e.g. `#[tokio::main] async fn main()`).");
  }
  const runRoot = path.join(RUNTIME_ROOT, "tmp");
  await mkdir(runRoot, { recursive: true });
  const dir = await mkdtemp(path.join(runRoot, "rust-"));
  try {
    const bin = path.join(dir, "main");
    await writeFile(path.join(dir, "main.rs"), code + SHIM, "utf8");
    const compiled = await runProcess(
      { cmd: manifest.rustc, args: rustcArgs(manifest, "main.rs", bin) },
      dir,
      COMPILE_TIMEOUT_MS,
    );
    if (compiled.exitCode !== 0) {
      // rustc diagnostics name main.rs:line:col — accurate, since the shim is appended
      return { ...compiled, stderr: compiled.stderr + missingVenueHint(compiled.stderr, manifest) };
    }
    // Warnings (unused imports etc.) are worth showing, but before the
    // program's own output — not interleaved with it.
    if (compiled.stderr && onChunk) onChunk("stderr", compiled.stderr);
    const result = await runProcess({ cmd: bin, args: [], env: rustEnv() }, dir, RUN_TIMEOUT_MS, onChunk);
    let stderr = compiled.stderr + result.stderr;
    if (result.exitCode === 101) {
      // 101 = the process died on a panic. If the last panic was a ccxt one the
      // hook swallowed, nothing explains the exit yet — print it now.
      const swallowed = await readFile(path.join(dir, PANIC_FILE), "utf8").catch(() => null);
      if (swallowed !== null) {
        const note = `\nthread panicked inside ccxt (not caught):\n${swallowed}\n`;
        onChunk?.("stderr", note);
        stderr += note;
      }
    }
    return { ...result, stderr, durationMs: compiled.durationMs + result.durationMs };
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

function earlyError(stderr: string): RunResult {
  return { stdout: "", stderr, exitCode: null, durationMs: 0, timedOut: false, truncated: false };
}

function notProvisioned(): RunResult {
  return earlyError(
    "Rust runtime not provisioned. Run `npm run setup-runtimes` in the playground/ directory (needs a Rust toolchain via rustup).",
  );
}
