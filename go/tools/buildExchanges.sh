#!/bin/sh

set -e


# ---------------------------------------------------------------------------------

cd "${0%/*}"
cd apiparser/
DIR=`pwd`
echo "Building API methods from $DIR"
go run $DIR/apiparser.go -name api
go run $DIR/apiparser.go -name exchange
go run $DIR/apiparser.go -name api -testfiles
go run $DIR/apiparser.go -name exchange -testfiles