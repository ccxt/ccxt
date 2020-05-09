#!/bin/sh

set -e


# ---------------------------------------------------------------------------------

cd "${0%/*}"
cd apiparser/
echo "Building TS files"
go run $DIR -lang 1