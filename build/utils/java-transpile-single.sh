#!/usr/bin/env bash
#
# Single-exchange Java transpile (CI's "specific" path) plus the typed-return
# post-pass, so a venue regenerated on its own stays consistent with the
# committed typed cores and pre-converted wrappers. Args forward to javaTranspiler.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
cd "$ROOT"

npx tsx build/javaTranspiler.ts "$@"
python3 build/typeJavaCoresPipeline.py
