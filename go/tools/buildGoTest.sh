#!/bin/sh

set -e


# ---------------------------------------------------------------------------------

cd "${0%/*}"
cd apiparser/
echo "Building Go TEST methods"
echo "This will overwrite current edited test files if present"
read -p "Continue (y/n)?" choice
case "$choice" in 
  y|Y ) go run $DIR/apiparser.go -lang 0 -test;;
  n|N ) echo "abort";;
  * ) echo "invalid entry, abort";;
esac