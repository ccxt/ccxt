#!/bin/sh

set -e


# ---------------------------------------------------------------------------------

cd "${0%/*}"
cd apiparser/
DIR=`pwd`
echo "Building API methods from $DIR"
go run $DIR/apiparser.go -name api