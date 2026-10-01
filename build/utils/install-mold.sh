#!/usr/bin/env bash
# Downloads and extracts the official static mold binary into ~/.cache/ccxt/mold.
# Requires no root/sudo privileges.

set -euo pipefail

MOLD_VERSION="${CCXT_MOLD_VERSION:-2.42.1}"
CACHE_DIR="${XDG_CACHE_HOME:-$HOME/.cache}/ccxt/mold"

OS="$(uname -s 2>/dev/null || echo "Unknown")"
if [ "$OS" != "Linux" ]; then
    echo "[install-mold] Precompiled mold is only supported on Linux (detected: $OS)." >&2
    exit 1
fi

ARCH="$(uname -m 2>/dev/null || echo "Unknown")"
case "$ARCH" in
    x86_64)   MOLD_ARCH="x86_64" ;;
    aarch64)  MOLD_ARCH="aarch64" ;;
    arm64)    MOLD_ARCH="aarch64" ;;
    *)
        echo "[install-mold] Unsupported architecture: $ARCH" >&2
        exit 1
        ;;
esac

MOLD_BIN="$CACHE_DIR/bin/mold"
if [ -x "$MOLD_BIN" ]; then
    echo "[install-mold] mold already installed at: $MOLD_BIN" >&2
    "$MOLD_BIN" --version >&2
    exit 0
fi

echo "[install-mold] Installing mold v${MOLD_VERSION} (${MOLD_ARCH}) to $CACHE_DIR..." >&2

mkdir -p "$CACHE_DIR"
URL="https://github.com/rui314/mold/releases/download/v${MOLD_VERSION}/mold-${MOLD_VERSION}-${MOLD_ARCH}-linux.tar.gz"

if ! command -v tar >/dev/null 2>&1 || ! command -v gzip >/dev/null 2>&1; then
    echo "[install-mold] Error: tar and gzip are required to unpack mold." >&2
    exit 1
fi

if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$URL" | tar -xzf - --strip-components=1 -C "$CACHE_DIR"
elif command -v wget >/dev/null 2>&1; then
    wget -qO- "$URL" | tar -xzf - --strip-components=1 -C "$CACHE_DIR"
else
    echo "[install-mold] Error: curl or wget is required to download mold." >&2
    exit 1
fi

if [ -x "$MOLD_BIN" ]; then
    echo "[install-mold] Successfully installed: $("$MOLD_BIN" --version)" >&2
else
    echo "[install-mold] Error: mold binary not found at $MOLD_BIN after extraction." >&2
    exit 1
fi
