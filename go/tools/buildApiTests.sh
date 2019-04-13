#!/bin/sh

set -e


# ---------------------------------------------------------------------------------

cd "${0%/*}"
cd apiparser/
DIR=`pwd`
echo "Building API TEST methods from $DIR"
echo "This will overwrite current edited test files if present"
read -p "Continue (y/n)?" choice
case "$choice" in 
  y|Y ) go run $DIR/apiparser.go -name api -testfiles;;
  n|N ) echo "abort";;
  * ) echo "invalid entry, abort";;
esac