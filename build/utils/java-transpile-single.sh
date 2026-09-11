#!/usr/bin/env bash
#
# Single-exchange Java transpile (CI's "specific" path) plus the typed-return
# post-pass, so a venue regenerated on its own stays consistent with the
# committed typed cores and the pre-converted wrappers. Args are forwarded to
# build/javaTranspiler.ts (e.g. `-- binance`, `-- --ws binance`).
#
# npm run transpileJavaSingle -- binance
#   -> tsx build/javaTranspiler.ts binance
#   -> python3 build/typeJavaCoresPipeline.py      (idempotent over the whole tree)
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
cd "$ROOT"

npx tsx build/javaTranspiler.ts "$@"
python3 build/typeJavaCoresPipeline.py
