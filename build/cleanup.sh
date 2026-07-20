#!/bin/sh
# build/cleanup.sh — restore generated/transpiled files to HEAD
# works when invoked as:  cd build && ./cleanup.sh
#                    or:  ./build/cleanup.sh
#                    or:  /abs/path/to/ccxt/build/cleanup.sh  (from anywhere)

set -eu

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd -P)

if [ -e "$script_dir/../.git" ]; then
    root=$(CDPATH= cd -- "$script_dir/.." && pwd -P)
else
    root=$(git -C "$script_dir" rev-parse --show-toplevel) || {
        echo "error: cannot locate ccxt repo root" >&2
        exit 1
    }
fi

cd -- "$root"

# restore <path> — checkout path from HEAD, skipping paths that no longer
# exist in HEAD instead of aborting the whole cleanup
restore() {
    if git cat-file -e "HEAD:$1" 2>/dev/null; then
        git checkout HEAD -- "$1"
    else
        echo "warning: skipping '$1' (not present in HEAD)" >&2
    fi
}

restore package.json
restore package-lock.json
restore yarn.lock
restore README.md
restore js
restore cs/ccxt/api
restore cs/ccxt/exchanges
restore cs/tests/Generated
restore cs/ccxt/wrappers
restore cs/ccxt/base/Exchange.Wrappers.cs
restore cs/ccxt/base/Exchange.BaseMethods.cs
restore cs/ccxt/base/Exchange.MetaData.cs
restore ts/ccxt.ts
restore ts/src/abstract
restore python
restore php
restore dist
restore examples
restore go/v4/exchange_metadata.go
restore go/v4/pro/exchange_metadata.go
restore wiki/Exchange-Markets.md
restore wiki/Manual.md

# pathspec magic can't go through cat-file; guard on the directory instead
if git cat-file -e "HEAD:go/v4" 2>/dev/null; then
    git checkout HEAD -- go/v4 ':(exclude)exchange'
fi