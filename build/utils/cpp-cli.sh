#!/bin/bash
# C++ CLI wrapper for `npm run cpp -- <exchangeId> <method> [arg...]`, mirroring
# build/utils/java-cli.sh: builds ccxt-cli when it is missing or older than its
# sources, then execs it. Repo-root cwd is required (fixture/key paths).
set -e
cd "$(dirname "$0")/../.."
if [ ! -x cpp/build/ccxt-cli ] || [ -n "$(find cpp/cli cpp/ccxt/base cpp/ccxt/pro cpp/ccxt/exchanges -newer cpp/build/ccxt-cli 2>/dev/null | head -1)" ]; then
    cmake --build cpp/build --target ccxt-cli --parallel 14
fi
exec ./cpp/build/ccxt-cli "$@"
