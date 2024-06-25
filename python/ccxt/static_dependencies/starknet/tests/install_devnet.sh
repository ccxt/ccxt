#!/bin/bash
set -e

DEVNET_INSTALL_DIR="$(git rev-parse --show-toplevel)/starknet_py/tests/e2e/devnet/bin"
DEVNET_REPO="https://github.com/0xSpaceShard/starknet-devnet-rs"
DEVNET_VERSION="v0.0.5"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
      echo "$1 is not available"
      echo "Please install $1 and run the script again"
      exit 1
  fi
}

get_architecture() {
  local _ostype _cputype _arch _clibtype
  _ostype="$(uname -s)"
  _cputype="$(uname -m)"
  _clibtype="gnu"

  if [ "$_ostype" = Linux ] && ldd --_requested_version 2>&1 | grep -q 'musl'; then
    _clibtype="musl"
  fi

  if [ "$_ostype" = Darwin ] && [ "$_cputype" = i386 ] && sysctl hw.optional.x86_64 | grep -q ': 1'; then
    _cputype=x86_64
  fi

  case "$_ostype" in
  Linux)
    _ostype=unknown-linux-$_clibtype
    ;;

  Darwin)
    _ostype=apple-darwin
    ;;
  *)
    err "unsupported OS type: $_ostype"
    ;;
  esac

  case "$_cputype" in
  aarch64 | arm64)
    _cputype=aarch64
    ;;

  x86_64 | x86-64 | x64 | amd64)
    _cputype=x86_64
    ;;
  *)
    err "unknown CPU type: $_cputype"
    ;;
  esac

  _arch="${_cputype}-${_ostype}"

  RETVAL="$_arch"
}

require_cmd curl
require_cmd tar

get_architecture
SYSTEM_TRIPLET="$RETVAL"

mkdir -p "${DEVNET_INSTALL_DIR}"
curl -L "${DEVNET_REPO}/releases/download/${DEVNET_VERSION}/starknet-devnet-${SYSTEM_TRIPLET}.tar.gz" | tar -xz -C "${DEVNET_INSTALL_DIR}" || exit 1

echo "All done!"
exit 0
