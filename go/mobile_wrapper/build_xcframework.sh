#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

# go clean -cache -testcache -fuzzcache
# rm -rf "$(go env GOMODCACHE)/cache/download"
# rm -rf /var/folders/*/*/*/T/gomobile-work-* || true

go mod tidy

go get golang.org/x/mobile/cmd/gomobile   
gomobile init
gomobile bind -target=ios,macos -o CCXT.xcframework .

echo "Build complete: CCXT.xcframework"
