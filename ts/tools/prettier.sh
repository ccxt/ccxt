#!/bin/sh

set -e


# ---------------------------------------------------------------------------------

cd "${0%/*}"
cd ../
echo "Prettier running on TS files"
npx prettier --write "src/**/*.ts"