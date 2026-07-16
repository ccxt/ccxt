#!/bin/sh
# build/cleanup.sh — restore generated/transpiled files to HEAD
# works when invoked as:  cd build && ./cleanup.sh
#                    or:  ./build/cleanup.sh
#                    or:  /abs/path/to/ccxt/build/cleanup.sh  (from anywhere)

set -eu

# Resolve the directory this script lives in, from $0 (POSIX — no BASH_SOURCE).
# CDPATH= guards against a user CDPATH hijacking cd; pwd -P resolves symlinks.
script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd -P)

# The repo root is one level above build/. If that doesn't look like a git
# root (e.g. the script was copied elsewhere), fall back to asking git.
if [ -e "$script_dir/../.git" ]; then
    root=$(CDPATH= cd -- "$script_dir/.." && pwd -P)
else
    root=$(git -C "$script_dir" rev-parse --show-toplevel) || {
        echo "error: cannot locate ccxt repo root" >&2
        exit 1
    }
fi

cd -- "$root"

git checkout HEAD -- package.json
git checkout HEAD -- package-lock.json
git checkout HEAD -- yarn.lock
git checkout HEAD -- README.md
git checkout HEAD -- js
git checkout HEAD -- cs/ccxt/api
git checkout HEAD -- cs/ccxt/exchanges
git checkout HEAD -- cs/tests/Generated
git checkout HEAD -- cs/ccxt/wrappers/
git checkout HEAD -- cs/ccxt/base/Exchange.Wrappers.cs
git checkout HEAD -- cs/ccxt/base/Exchange.BaseMethods.cs
git checkout HEAD -- cs/ccxt/base/Exchange.MetaData.cs
git checkout HEAD -- ts/ccxt.ts
git checkout HEAD -- ts/src/abstract
git checkout HEAD -- python
git checkout HEAD -- php
git checkout HEAD -- dist
git checkout HEAD -- examples
git checkout HEAD -- go/v4/exchange_metadata.go
git checkout HEAD -- go/v4/pro/exchange_metadata.go
git checkout HEAD -- wiki/Exchange-Markets.md
git checkout HEAD -- wiki/Manual.md
git checkout HEAD -- go/v4 ':(exclude)exchange'