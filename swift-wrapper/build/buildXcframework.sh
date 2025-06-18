#!/usr/bin/env bash
OUTPUT_DIR="./Sources/CCXTSwiftCore"
framework="$OUTPUT_DIR/CCXT.xcframework"
gomobile_header="${OUTPUT_DIR}/CCXT.xcframework/ios-arm64/CCXT.framework/Headers/Ccxt.objc.h"
objc_headers=(
    "$OUTPUT_DIR/CCXT.xcframework/ios-arm64/CCXT.framework/Headers/Ccxt.objc.h"
    "$OUTPUT_DIR/CCXT.xcframework/ios-arm64_x86_64-simulator/CCXT.framework/Headers/Ccxt.objc.h"
    "$OUTPUT_DIR/CCXT.xcframework/macos-arm64_x86_64/CCXT.framework/Headers/Ccxt.objc.h"
)

extract_methods_from_header() {
  local file="$1"
  grep -E '^\s*- \([^)]+\)' "$file"
}

parse_method_signature() {
  local method_line="$1"

  # Extract method name
  local method_name
  method_name=$(echo "$method_line" | sed -E 's/^- \([^)]+\)[[:space:]]*([a-zA-Z0-9_]+).*/\1/')

  # Extract param names (excluding "error")
  local param_names=()
  while read -r param; do
    [[ "$param" == "error" ]] && continue
    param_names+=("$param")
  done < <(echo "$method_line" | grep -oE ':[^:;]*\([^)]+\)[[:space:]]*([a-zA-Z0-9_]+)' | sed -E 's/^.*\([^)]+\)[[:space:]]*//')

  echo "$method_name" "${param_names[*]}"
}

generate_swift_name() {
  local method_name="$1"
  shift
  local param_list="$*"

  if [[ -n "$param_list" ]]; then
    echo "NS_SWIFT_NAME(${method_name}(${param_list// /, }))"
  else
    echo "NS_SWIFT_NAME(${method_name}())"
  fi
}

patch_objc_header_with_swift_names() {
    local file="$1"
    local tmpfile
    tmpfile=$(mktemp)

    while IFS= read -r line; do
        if grep -E '^\s*- \([^)]+\)' <<< "$line" >/dev/null; then
            newLine=$(sed 's/;*$//' <<< "$line")
            read -r method param_list <<< "$(parse_method_signature "$line")"
            annotation=$(generate_swift_name "$method" $param_list)
            echo "$newLine ${annotation};" >> $tmpfile
        else
            echo "$line" >> $tmpfile
        fi
    done < $file

    mv "$tmpfile" "$file"
}

cd "$(dirname "$0")/.."

# go mod tidy
go get golang.org/x/mobile/cmd/gomobile
go get golang.org/x/mobile/bind
gomobile init

# Where SPM wants the xcframework

# Create the output dir
mkdir -p "$OUTPUT_DIR"

# Build into the right folder for SPM
gomobile bind -target=ios,iossimulator,macos -o "$framework" .

for header in "${objc_headers[@]}"; do
    patch_objc_header_with_swift_names "$header"
done

cp ../LICENSE.txt $OUTPUT_DIR/LICENSE.txt

skipped_methods=$(grep 'skipped method' "$gomobile_header" | sed -n 's/.*skipped method [^.]*\.\([A-Za-z0-9_]*\).*/\1/p')
echo $skipped_methods
if [[ -n "$skipped_methods" ]]; then
    method_list=$(echo "$skipped_methods" | paste -sd ", " -)
    echo "ERROR: $method_list contain invalid param types in swift-wrapper/ccxtwrapper.go, param types can only include int, float64, string, bool and []byte. If it is a custom type, it must be added to the customTypes array in swift-wrapper/build/transpileSwift.ts"
    exit 1
fi

echo "SPM Build complete: $framework"
