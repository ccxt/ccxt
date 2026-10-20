#!/usr/bin/env bash
# Dynamic cargo runner with automatic high-performance linker detection (mold -> lld -> default).
#
# Override via CCXT_CARGO_LINKER:
#   CCXT_CARGO_LINKER=mold     Force mold linker
#   CCXT_CARGO_LINKER=lld      Force LLVM lld linker
#   CCXT_CARGO_LINKER=default  Force system default linker (GNU ld)
#
# Set CCXT_CARGO_VERBOSE_LINKER=1 to log the selected linker.
# Set CCXT_AUTO_INSTALL_MOLD=1 to auto-download mold if missing (Linux only).

set -euo pipefail

# Check for user-space cached mold binary (~/.cache/ccxt/mold/bin)
USER_MOLD_BIN="${XDG_CACHE_HOME:-$HOME/.cache}/ccxt/mold/bin"
if [ -d "$USER_MOLD_BIN" ]; then
    export PATH="$USER_MOLD_BIN:$PATH"
fi

# Auto-install mold if requested and missing on Linux
if ! command -v mold >/dev/null 2>&1 && [ "${CCXT_AUTO_INSTALL_MOLD:-}" = "1" ] && [ "$(uname -s 2>/dev/null)" = "Linux" ]; then
    SCRIPT_DIR="$(cd "${BASH_SOURCE[0]%/*}" && pwd)"
    if [ -x "$SCRIPT_DIR/install-mold.sh" ]; then
        "$SCRIPT_DIR/install-mold.sh" || echo "[cargo-runner] Auto-install mold failed; falling back to alternative linkers..." >&2
        if [ -d "$USER_MOLD_BIN" ]; then
            export PATH="$USER_MOLD_BIN:$PATH"
        fi
    fi
fi

LINKER_PREF="${CCXT_CARGO_LINKER:-auto}"
SELECTED_LINKER="default"

if [ "$LINKER_PREF" = "default" ]; then
    SELECTED_LINKER="default"
elif [ "$LINKER_PREF" = "mold" ] || { [ "$LINKER_PREF" = "auto" ] && [ "$(uname -s 2>/dev/null)" = "Linux" ] && command -v mold >/dev/null 2>&1; }; then
    SELECTED_LINKER="mold"
elif [ "$LINKER_PREF" = "lld" ] || { [ "$LINKER_PREF" = "auto" ] && command -v clang >/dev/null 2>&1 && clang -fuse-ld=lld -Wl,--version >/dev/null 2>&1; }; then
    SELECTED_LINKER="lld"
fi

if [ "${CCXT_CARGO_VERBOSE_LINKER:-}" = "1" ]; then
    echo "[cargo-runner] Using linker: $SELECTED_LINKER" >&2
fi

case "$SELECTED_LINKER" in
    mold)
        exec mold -run cargo "$@"
        ;;
    lld)
        export RUSTFLAGS="-C linker=clang -C link-arg=-fuse-ld=lld ${RUSTFLAGS:-}"
        exec cargo "$@"
        ;;
    *)
        exec cargo "$@"
        ;;
esac
