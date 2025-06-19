#!/usr/bin/env bash
gomobile_header="./Sources/CCXTSwiftCore/CCXT.xcframework/ios-arm64/CCXT.framework/Headers/Ccxt.objc.h"
OUTPUT_DIR="./Sources/CCXTSwiftCore"
framework="$OUTPUT_DIR/CCXT.xcframework"

set -euo pipefail
cd "$(dirname "$0")/.."

# go mod tidy
go get golang.org/x/mobile/cmd/gomobile
go get golang.org/x/mobile/bind
gomobile init

# Where SPM wants the xcframework

# Create the output dir
mkdir -p "$OUTPUT_DIR"

# Build into the right folder for SPM
export GOMOBILE_WORK=./.cache/gomobile
gomobile bind -target=ios,iossimulator,macos -o "$framework" .

cp ../LICENSE.txt $OUTPUT_DIR/LICENSE.txt

skipped_methods=$(grep 'skipped method' "$gomobile_header" | sed -n 's/.*skipped method [^.]*\.\([A-Za-z0-9_]*\).*/\1/p')
echo $skipped_methods
if [[ -n "$skipped_methods" ]]; then
    method_list=$(echo "$skipped_methods" | paste -sd ", " -)
    echo "ERROR: $method_list contain invalid param types in swift-wrapper/ccxtwrapper.go, param types can only include int, float64, string, bool and []byte. If it is a custom type, it must be added to the customTypes array in swift-wrapper/build/transpileSwift.ts"
    exit 1
fi

echo "SPM Build complete: $framework"
