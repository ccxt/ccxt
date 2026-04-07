#!/bin/bash
# Regenerate .pb.go files from .proto sources
# Requires: protoc, protoc-gen-go
#   go install google.golang.org/protobuf/cmd/protoc-gen-go@latest

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROTO_DIR="$SCRIPT_DIR/proto"
OUT_DIR="$SCRIPT_DIR"

echo "Generating .pb.go files from $PROTO_DIR..."
protoc --proto_path="$PROTO_DIR" --go_out="$OUT_DIR" --go_opt=module=github.com/mtan11/ccxt/go/v4/protoc "$PROTO_DIR"/*.proto
echo "Done. Files written to $OUT_DIR"
