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

echo "==> Done."
exit 0
