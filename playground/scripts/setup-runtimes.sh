#!/usr/bin/env bash
# Provision the Python and PHP runtimes the executor uses.
#
# JavaScript needs nothing extra — it uses the playground's own node_modules/ccxt.
# Python and PHP get isolated, pinned CCXT installs under runtime/.
#
# Both runners fall back to the monorepo's in-repo CCXT if these are missing
# (system python3 + PYTHONPATH=../python, and ../ccxt.php), so this script is a
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
if command -v python3 >/dev/null 2>&1; then
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
  echo "    python3 not found — runner will fall back to monorepo ../python"
fi

echo "==> PHP runtime (runtime/php/vendor)"
if command -v composer >/dev/null 2>&1; then
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
  echo "    composer not found — runner will fall back to monorepo ../ccxt.php"
fi

CCXT_GO_VERSION="${CCXT_GO_VERSION:-v4.5.56}"
CCXT_NUGET_VERSION="${CCXT_NUGET_VERSION:-}" # empty = latest

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
  export GOCACHE="$GO_ROOT/.cache" GOMODCACHE="$GO_ROOT/.modcache" GOPATH="$GO_ROOT/.gopath" GOTOOLCHAIN=auto GOFLAGS=-mod=mod
  ( cd "$GO_ROOT" && "$GOBIN" mod tidy && "$GOBIN" build ./runs/warmup ) && echo "    go ccxt build cache warmed ($GOBIN)"
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

echo "==> Done."
exit 0
