#!/bin/sh

set -e


# ---------------------------------------------------------------------------------

cd "${0%/*}"
cd apiparser/
echo "Building Go files"
go run $DIR/apiparser.go -lang 0