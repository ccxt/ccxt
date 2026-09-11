#!/bin/bash
# C++ CLI wrapper for `npm run cpp -- <exchangeId> <method> [arg...]`, mirroring
# build/utils/java-cli.sh: builds ccxt-cli when it is missing or older than its
# sources, then execs it. Repo-root cwd is required (fixture/key paths).
set -e
cd "$(dirname "$0")/../.."
if pgrep -x ninja >/dev/null 2>&1; then
    # an in-flight build links ccxt-cli itself; wait it out instead of racing a
    # second ninja on the same build dir (double-compiles and lock contention)
    while pgrep -x ninja >/dev/null 2>&1; do sleep 2; done
fi
if [ ! -x cpp/build/ccxt-cli ] || [ -n "$(find cpp/cli cpp/ccxt/base cpp/ccxt/pro cpp/ccxt/exchanges -newer cpp/build/ccxt-cli 2>/dev/null | head -1)" ]; then
    # -j8: -j14 OOM-kills big TUs against the session cgroup memory cap
    cmake --build cpp/build --target ccxt-cli --parallel 8
fi
exec ./cpp/build/ccxt-cli "$@"
