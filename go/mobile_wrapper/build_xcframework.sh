#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

# go mod tidy
go get golang.org/x/mobile/cmd/gomobile
go get golang.org/x/mobile/bind
gomobile init

# Where SPM wants the xcframework
OUTPUT_DIR="./Sources/CCXTPodCore"

# Create the output dir
mkdir -p "$OUTPUT_DIR"

# Build into the right folder for SPM
gomobile bind -target=ios,iossimulator,macos -o "$OUTPUT_DIR/CCXT.xcframework" .

cp ../../LICENSE.txt $OUTPUT_DIR/LICENSE.txt

echo "SPM Build complete: $OUTPUT_DIR/CCXT.xcframework"
