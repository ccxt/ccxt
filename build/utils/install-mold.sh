#!/usr/bin/env bash
# Downloads, verifies SHA-256 checksum, and extracts the official static mold binary into ~/.cache/ccxt/mold.
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
    x86_64)
        MOLD_ARCH="x86_64"
        EXPECTED_SHA256="6ff270c9bf07d2bec5c98aa324eb7c4daf6a1a4d815c05ff1708049616047855"
        ;;
    aarch64|arm64)
        MOLD_ARCH="aarch64"
        EXPECTED_SHA256="16b025652d3d7456689e6025a77e1903bb2a15e7630877c26cc133f5df95b9c6"
        ;;
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

TMP_ARCHIVE=$(mktemp -t mold-XXXXXX.tar.gz)
trap 'rm -f "$TMP_ARCHIVE"' EXIT

if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$URL" -o "$TMP_ARCHIVE"
elif command -v wget >/dev/null 2>&1; then
    wget -qO "$TMP_ARCHIVE" "$URL"
else
    echo "[install-mold] Error: curl or wget is required to download mold." >&2
    exit 1
fi

# Verify SHA-256 checksum against pinned release hash
if command -v sha256sum >/dev/null 2>&1; then
    ACTUAL_SHA256=$(sha256sum "$TMP_ARCHIVE" | awk '{print $1}')
elif command -v shasum >/dev/null 2>&1; then
    ACTUAL_SHA256=$(shasum -a 256 "$TMP_ARCHIVE" | awk '{print $1}')
else
    echo "[install-mold] Error: sha256sum or shasum is required to verify mold checksum." >&2
    exit 1
fi

if [ "$ACTUAL_SHA256" != "$EXPECTED_SHA256" ]; then
    echo "[install-mold] Error: Checksum mismatch for mold archive!" >&2
    echo "[install-mold] Expected: $EXPECTED_SHA256" >&2
    echo "[install-mold] Got:      $ACTUAL_SHA256" >&2
    exit 1
fi

tar -xzf "$TMP_ARCHIVE" --strip-components=1 -C "$CACHE_DIR"

if [ -x "$MOLD_BIN" ]; then
    echo "[install-mold] Successfully verified and installed: $("$MOLD_BIN" --version)" >&2
else
    echo "[install-mold] Error: mold binary not found at $MOLD_BIN after extraction." >&2
    exit 1
fi
