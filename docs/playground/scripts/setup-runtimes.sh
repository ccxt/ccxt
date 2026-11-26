#!/usr/bin/env bash
# Provision the Python and PHP runtimes the executor uses.
#
# TypeScript needs nothing extra — it uses the playground's own node_modules/ccxt.
# Python and PHP get isolated, pinned CCXT installs under runtime/.
#
# Both runners fall back to the monorepo's in-repo CCXT if these are missing
# (system python3 + PYTHONPATH=../../python, and ../../ccxt.php), so this script is a
# nice-to-have for a clean, decoupled install rather than a hard requirement.

# No `set -e`: provisioning a runtime is best-effort. If one language fails to
# install/warm (e.g. a native dep that crashes on a given CPU arch), we log a
# warning and continue so the rest still works and the Docker build doesn't abort.
set -uo pipefail
cd "$(dirname "$0")/.."

CCXT_VERSION="${CCXT_VERSION:-}" # empty = latest

# Languages listed in PLAYGROUND_DISABLED (comma-separated, e.g. "go") are
# install-only — skip provisioning so we don't, say, run Go's memory-heavy
# ccxt compile on a small shared host.
DISABLED="${PLAYGROUND_DISABLED:-}"
is_disabled() { case ",$DISABLED," in *",$1,"*) return 0 ;; *) return 1 ;; esac; }

echo "==> Python runtime (runtime/python/.venv)"
if is_disabled python; then
  echo "    python disabled (PLAYGROUND_DISABLED) — install-only, skipping venv"
elif command -v python3 >/dev/null 2>&1; then
  mkdir -p runtime/python
  python3 -m venv runtime/python/.venv
  # shellcheck disable=SC1091
  source runtime/python/.venv/bin/activate
  python -m pip install --quiet --upgrade pip
  if [ -n "$CCXT_VERSION" ]; then
    python -m pip install --quiet "ccxt==${CCXT_VERSION}"
  else
    python -m pip install --quiet ccxt
  fi
  python -c "import ccxt; print('    python ccxt', ccxt.__version__)" \
    || echo "    warning: python ccxt import failed on this arch (Python runner will be unavailable; works on amd64)"
  deactivate || true
else
  echo "    python3 not found — runner will fall back to monorepo ../../python"
fi

echo "==> PHP runtime (runtime/php/vendor)"
if is_disabled php; then
  echo "    php disabled (PLAYGROUND_DISABLED) — install-only, skipping composer install"
elif command -v composer >/dev/null 2>&1; then
  mkdir -p runtime/php
  cat > runtime/php/composer.json <<'JSON'
{
    "require": {
        "ccxt/ccxt": "*"
    }
}
JSON
  if (cd runtime/php && composer install --quiet --no-interaction); then
    echo "    php ccxt installed via composer"
  else
    echo "    warning: php composer install failed (PHP runner will be unavailable)"
  fi
else
  echo "    composer not found — runner will fall back to monorepo ../../ccxt.php"
fi

# Pseudo-version of master @ 6654bd39a17c (#29357) — the first ccxt-go with
# Proxy: http.ProxyFromEnvironment on its transport. Every tagged release up to
# v4.5.70 dials direct, ignoring HTTP(S)_PROXY, so behind the playground's
# egress proxy (internal network, squid allowlist) all exchange calls fail with
# a DNS error. Move this back to a normal release pin once the next tag is cut.
CCXT_GO_VERSION="${CCXT_GO_VERSION:-v4.5.71-0.20260730115723-6654bd39a17c}"
CCXT_NUGET_VERSION="${CCXT_NUGET_VERSION:-}" # empty = latest
CCXT_JAVA_VERSION="${CCXT_JAVA_VERSION:-}" # empty = latest (Maven Central)

echo "==> Go runtime (runtime/go) — warms the ccxt build cache (~45s cold)"
if is_disabled go; then
  echo "    go disabled (PLAYGROUND_DISABLED) — install-only, skipping warm build"
else
# Pick a Go >= 1.24 (ccxt's go module requires it); prefer it over an older shim.
pick_go() {
  for cand in go /opt/homebrew/bin/go /usr/local/go/bin/go; do
    if command -v "$cand" >/dev/null 2>&1; then
      v="$("$cand" version 2>/dev/null | sed -nE 's/.*go([0-9]+)\.([0-9]+).*/\1 \2/p')"
      maj="${v% *}"; min="${v#* }"
      if [ "${maj:-0}" -gt 1 ] || { [ "${maj:-0}" -eq 1 ] && [ "${min:-0}" -ge 24 ]; }; then
        echo "$cand"; return 0
      fi
    fi
  done
  return 1
}
if GOBIN="$(pick_go)"; then
  GO_ROOT="$PWD/runtime/go"
  mkdir -p "$GO_ROOT/runs/warmup"
  cat > "$GO_ROOT/go.mod" <<MOD
module playground/runtime

go 1.24

require github.com/ccxt/ccxt/go/v4 ${CCXT_GO_VERSION}
MOD
  cat > "$GO_ROOT/runs/warmup/main.go" <<'GO'
package main

import ccxt "github.com/ccxt/ccxt/go/v4"

func main() { _ = ccxt.NewBinance(nil) }
GO
  echo "$GOBIN" > "$GO_ROOT/.gobin"
  # GONOSUMDB for ccxt's own module: sum.golang.org indexes fresh (pseudo-)
  # versions with a lag — deploy 30700554711 failed because the sumdb 404'd a
  # pseudo-version that proxy.golang.org already served. Skipping the checksum
  # DB for github.com/ccxt only is safe: the hashes still land in go.sum here,
  # and every later `go run` verifies against that go.sum.
  export GOCACHE="$GO_ROOT/.cache" GOMODCACHE="$GO_ROOT/.modcache" GOPATH="$GO_ROOT/.gopath" GOTOOLCHAIN=auto GOFLAGS=-mod=mod GONOSUMDB=github.com/ccxt
  if ( cd "$GO_ROOT" && "$GOBIN" mod tidy && "$GOBIN" build ./runs/warmup ); then
    echo "    go ccxt build cache warmed ($GOBIN)"
  else
    # The runner treats a present go.mod as "provisioned" — leaving it behind
    # after a failed warm gives users raw compile errors instead of the clean
    # provision message, and go run without go.sum can't work at all.
    echo "    warning: go warm build failed (Go tab will show the provision message)"
    rm -f "$GO_ROOT/go.mod" "$GO_ROOT/go.sum"
  fi
  rm -rf "$GO_ROOT/runs/warmup" "$GO_ROOT/warmup"
else
  echo "    no Go >= 1.24 found — the Go tab will show a 'provision' message until one is installed"
fi
fi

echo "==> C# runtime (runtime/csharp) — restores ccxt + warms the build"
if is_disabled csharp; then
  echo "    csharp disabled (PLAYGROUND_DISABLED) — install-only, skipping warm build"
elif command -v dotnet >/dev/null 2>&1; then
  CS_APP="$PWD/runtime/csharp/app"
  rm -rf "$CS_APP"
  dotnet new console -o "$CS_APP" --force >/dev/null 2>&1
  if [ -n "$CCXT_NUGET_VERSION" ]; then
    ( cd "$CS_APP" && dotnet add package ccxt --version "$CCXT_NUGET_VERSION" >/dev/null 2>&1 )
  else
    ( cd "$CS_APP" && dotnet add package ccxt >/dev/null 2>&1 )
  fi
  cat > "$CS_APP/Program.cs" <<'CS'
using ccxt;
var exchange = new Binance();
_ = exchange.id;
CS
  if ( cd "$CS_APP" && DOTNET_NOLOGO=1 dotnet build >/dev/null 2>&1 ); then
    echo "    c# ccxt restored & build warmed"
  else
    echo "    warning: c# restore/build failed (C# runner will be unavailable)"
  fi
else
  echo "    dotnet not found — the C# tab will show a 'provision' message until the .NET SDK is installed"
fi

echo "==> Java runtime (runtime/java/libs) — resolves ccxt jars (~47 MB) via Maven"
if is_disabled java; then
  echo "    java disabled (PLAYGROUND_DISABLED) — install-only, skipping jar resolve"
elif [ -z "$CCXT_JAVA_VERSION" ] && [ -d runtime/java/libs ] && [ -f runtime/java/classes/Playground.class ]; then
  # The Docker image pre-provisions these from the java-libs build stage. For
  # local re-runs this also keeps a Go/C# re-warm from re-resolving 47 MB of
  # jars; `rm -rf runtime/java` (or pin CCXT_JAVA_VERSION) to force a re-resolve.
  echo "    already provisioned — skipping (rm -rf runtime/java to re-resolve)"
elif command -v javac >/dev/null 2>&1 && command -v mvn >/dev/null 2>&1; then
  JAVA_ROOT="$PWD/runtime/java"
  rm -rf "$JAVA_ROOT"
  mkdir -p "$JAVA_ROOT/libs" "$JAVA_ROOT/classes"
  JV="$CCXT_JAVA_VERSION"
  if [ -z "$JV" ]; then JV="[0,)"; fi # Maven version range = latest release
  cat > "$JAVA_ROOT/pom.xml" <<POM
<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>
  <groupId>ccxt.playground</groupId>
  <artifactId>java-runtime</artifactId>
  <version>0</version>
  <packaging>jar</packaging>
  <dependencies>
    <dependency>
      <groupId>io.github.ccxt</groupId>
      <artifactId>ccxt</artifactId>
      <version>${JV}</version>
    </dependency>
  </dependencies>
</project>
POM
  mkdir -p "$JAVA_ROOT/smoke"
  cat > "$JAVA_ROOT/smoke/Main.java" <<'SMOKE'
import io.github.ccxt.exchanges.Binance;

public class Main {
    public static void main(String[] args) {
        Binance exchange = Playground.proxy(new Binance());
        System.out.println(exchange.id);
    }
}
SMOKE
  if mvn -q -B -f "$JAVA_ROOT/pom.xml" dependency:copy-dependencies -DoutputDirectory="$JAVA_ROOT/libs" \
     && javac -cp "$JAVA_ROOT/libs/*" -d "$JAVA_ROOT/classes" lib/runners/java/Playground.java \
     && javac -cp "$JAVA_ROOT/libs/*:$JAVA_ROOT/classes" -d "$JAVA_ROOT/smoke" "$JAVA_ROOT/smoke/Main.java"; then
    JRESOLVED="$(ls "$JAVA_ROOT/libs" | sed -n 's/^ccxt-\(.*\)\.jar$/\1/p' | head -1)"
    echo "    java ccxt ${JRESOLVED:-unknown} resolved ($(ls "$JAVA_ROOT/libs" | wc -l | tr -d ' ') jars) + Playground helper compiled"
  else
    echo "    warning: java resolve/compile failed (Java tab will show the provision message)"
    rm -rf "$JAVA_ROOT/libs" "$JAVA_ROOT/classes"
  fi
  rm -rf "$JAVA_ROOT/pom.xml" "$JAVA_ROOT/smoke"
else
  echo "    javac or mvn not found — the Java tab will show a 'provision' message until JDK 21+ and Maven are installed"
fi

CCXT_RUST_VERSION="${CCXT_RUST_VERSION:-}" # empty = latest (crates.io)
# Venues compiled into the Rust runtime (cargo features of ccxt / ccxt-pro).
# Each crate defaults to `all`, but ccxt-base puts every venue in ONE crate and
# a single rustc over all ~100 of them peaks past 14 GB even unoptimized — too
# much for an image build, and it bloats every run's link. The default is the
# venues people actually reach for (~4 min, ~6 GB peak at 2 jobs). Set
# CCXT_RUST_VENUES=all on a builder with ~20 GB free to compile everything.
CCXT_RUST_VENUES="${CCXT_RUST_VENUES:-binance,binanceusdm,binancecoinm,bybit,okx,coinbase,coinbaseexchange,kraken,krakenfutures,kucoin,kucoinfutures,bitget,gate,htx,mexc,bitfinex,bitstamp,gemini,cryptocom,hyperliquid,deribit,bingx,bitvavo,upbit,poloniex,whitebit}"
CCXT_RUST_PREDICTION="${CCXT_RUST_PREDICTION:-polymarket,kalshi,limitless,myriad,hyperliquid}"

echo "==> Rust runtime (runtime/rust) — prebuilds ccxt + ccxt-pro + ccxt-prediction (~10 min cold, ~6 GB peak)"
if is_disabled rust; then
  echo "    rust disabled (PLAYGROUND_DISABLED) — install-only, skipping prebuild"
elif [ -z "$CCXT_RUST_VERSION" ] && [ -f runtime/rust/externs.json ] && [ -x "$(sed -n 's/^  "rustc": "\(.*\)",$/\1/p' runtime/rust/externs.json)" ]; then
  # The Docker image pre-provisions this from the rust-runtime build stage
  # (whose cargo never ships). Locally it keeps a Go/C# re-warm from repeating
  # the ~10 min prebuild; `rm -rf runtime/rust` (or pin CCXT_RUST_VERSION) to rebuild.
  echo "    already provisioned — skipping (rm -rf runtime/rust to rebuild)"
elif command -v cargo >/dev/null 2>&1 && command -v rustc >/dev/null 2>&1; then
  RUST_ROOT="$PWD/runtime/rust"
  rm -rf "$RUST_ROOT"
  mkdir -p "$RUST_ROOT/src"
  RV="${CCXT_RUST_VERSION:-*}"
  # "a,b" -> cargo dependency spec with exactly those features ("all" -> defaults)
  crate_spec() {
    if [ "$1" = "all" ]; then echo "\"${RV}\""; return; fi
    echo "{ version = \"${RV}\", default-features = false, features = [$(echo "$1" | sed 's/[^,][^,]*/"&"/g; s/,/, /g')] }"
  }
  # The crates the user's main.rs may name. Runs invoke rustc directly with one
  # --extern per crate below (lib/runners/rust.ts), so this list IS the import
  # allowlist. Third-party deps (serde_json, tokio, rustls/ring, hashing) build
  # at opt-level 2 — that's where JSON parsing and TLS spend their time. The
  # ccxt crates stay at opt-level 0, as ccxt's own CI builds them: ccxt-base
  # holds every compiled venue in ONE crate, optimizing it multiplies rustc's
  # peak memory (opt-level 2 over all venues OOMed a 15 GB builder), and runs
  # are network-bound anyway (coinbase's 1,000+ markets parse in ~1.5s).
  # debug = 0 keeps target/ (and every run's link) small.
  cat > "$RUST_ROOT/Cargo.toml" <<TOML
[package]
name = "playground"
version = "0.0.0"
edition = "2021"
publish = false

[dependencies]
ccxt = $(crate_spec "$CCXT_RUST_VENUES")
ccxt-pro = $(crate_spec "$CCXT_RUST_VENUES")
ccxt-prediction = $(crate_spec "$CCXT_RUST_PREDICTION")
tokio = { version = "1", features = ["full"] }
serde_json = "1"
futures = "0.3"

[profile.dev]
debug = 0
incremental = false

[profile.dev.package."*"]
opt-level = 2

[profile.dev.package.ccxt-common]
opt-level = 0
[profile.dev.package.ccxt-base]
opt-level = 0
[profile.dev.package.ccxt]
opt-level = 0
[profile.dev.package.ccxt-pro]
opt-level = 0
[profile.dev.package.ccxt-prediction]
opt-level = 0
TOML
  cat > "$RUST_ROOT/src/main.rs" <<'RS'
fn main() {
    let _ = ccxt::Binance::new(None);
    let _ = ccxt_pro::Binance::new(None);
    let _ = ccxt_prediction::Polymarket::new(None);
    let _ = serde_json::json!({});
    let _ = futures::future::ready(());
    let _ = tokio::runtime::Builder::new_current_thread();
}
RS
  # rustc must be the exact compiler that built the rlibs (E0514 otherwise).
  # Resolve the real binary behind the rustup proxy so runs don't depend on
  # RUSTUP_HOME/RUSTUP_TOOLCHAIN surviving the scrubbed env.
  RUSTC_BIN="$(rustc --print sysroot)/bin/rustc"
  if ( cd "$RUST_ROOT" && RUSTC="$RUSTC_BIN" cargo build --message-format=json-render-diagnostics > build.jsonl ) \
     && node - "$RUST_ROOT" "$RUSTC_BIN" "$CCXT_RUST_VENUES" "$CCXT_RUST_PREDICTION" <<'JS'
// Turn cargo's artifact records into runtime/rust/externs.json: the exact
// rlib of each direct dependency (deps/ can hold several versions of a crate,
// so a bare `--extern name` would be ambiguous) plus the native search paths
// build scripts emitted (rustc-link-search is not recorded in the rlib).
const fs = require("fs");
const path = require("path");
const [root, rustc, venues, prediction] = process.argv.slice(2);
const wanted = new Set(["ccxt", "ccxt_pro", "ccxt_prediction", "tokio", "serde_json", "futures"]);
const externs = {};
const native = new Set();
// Every directory holding a library artifact. Cargo up to ~1.99 puts them all
// in target/debug/deps; newer cargo (build-dir layout) gives each crate its own
// target/debug/build/<pkg>/<hash>/out. Either way rustc needs an
// -L dependency=<dir> for each, to resolve the transitive crates by hash.
const depDirs = new Set();
const lines = fs.readFileSync(path.join(root, "build.jsonl"), "utf8").split("\n").filter(Boolean);
for (const line of lines) {
  const msg = JSON.parse(line);
  if (msg.reason === "build-script-executed") {
    for (const p of msg.linked_paths || []) native.add(p);
  }
  if (msg.reason !== "compiler-artifact") continue;
  const libs = msg.filenames.filter((f) => /\.(rlib|rmeta|so|dylib)$/.test(f));
  for (const f of libs) depDirs.add(path.relative(root, path.dirname(f)));
  if (!wanted.has(msg.target.name) || !msg.target.kind.includes("lib")) continue;
  const rlib = libs.find((f) => f.endsWith(".rlib"));
  if (rlib) externs[msg.target.name] = path.relative(root, rlib);
}
const missing = [...wanted].filter((n) => !externs[n]);
if (missing.length) { console.error("missing rlibs: " + missing.join(", ")); process.exit(1); }
const manifest = {
  rustc,
  edition: "2021",
  deps: [...depDirs].sort(),
  externs,
  // "native=/abs/path" or "/abs/path" → passed through as -L
  native: [...native],
  // Compiled-in venue ids ("all" = every venue), so the runner can explain a
  // missing one instead of surfacing rustc's bare "cannot find type".
  venues: venues === "all" ? "all" : venues.split(","),
  prediction: prediction === "all" ? "all" : prediction.split(","),
};
fs.writeFileSync(path.join(root, "externs.json"), JSON.stringify(manifest, null, 2) + "\n");
JS
  then
    # Smoke-compile the way a run does, so a manifest that can't link never ships.
    if node -e '
      const m = require(process.argv[1] + "/externs.json");
      const path = require("path");
      const { execFileSync } = require("child_process");
      const args = ["--edition", m.edition, "--crate-type", "bin", "-C", "opt-level=0"];
      for (const d of m.deps) args.push("-L", "dependency=" + path.join(process.argv[1], d));
      for (const p of m.native) args.push("-L", p);
      for (const [n, f] of Object.entries(m.externs)) args.push("--extern", n + "=" + path.join(process.argv[1], f));
      args.push("-o", path.join(process.argv[1], "smoke"), path.join(process.argv[1], "src", "main.rs"));
      execFileSync(m.rustc, args, { stdio: "inherit" });
    ' "$RUST_ROOT" && "$RUST_ROOT/smoke"; then
      RRESOLVED="$(grep -A1 '^name = "ccxt"$' "$RUST_ROOT/Cargo.lock" | sed -n 's/^version = "\(.*\)"$/\1/p')"
      echo "    rust ccxt ${RRESOLVED:-?} prebuilt ($("$RUSTC_BIN" --version))"
    else
      echo "    warning: rust smoke compile failed (Rust tab will show the provision message)"
      rm -f "$RUST_ROOT/externs.json"
    fi
  else
    echo "    warning: rust prebuild failed (Rust tab will show the provision message)"
    rm -f "$RUST_ROOT/externs.json"
  fi
  # Keep the library artifacts runs link against (target/debug/deps, or
  # target/debug/build/** under cargo's newer build-dir layout — which also
  # holds the build-script outputs native search paths point into) and
  # Cargo.lock; drop what runs never read.
  rm -rf "$RUST_ROOT/build.jsonl" "$RUST_ROOT/smoke" "$RUST_ROOT/target/debug/incremental" \
         "$RUST_ROOT/target/debug/playground" "$RUST_ROOT/target/debug/.fingerprint"
else
  echo "    cargo/rustc not found — the Rust tab will show a 'provision' message until a Rust toolchain is installed"
fi

echo "==> Done."
exit 0
