#!/usr/bin/env bash
set -e

ws=0
for arg in "$@"
do
    if [ "$arg" = "--ws" ]; then
        ws=1
        break
    fi
done

exchange_name="$1"

# Check if the first argument was provided
if [ -z "$exchange_name" ]; then
    echo "Exchange name not provided provided."
    exit 1
fi

if [ "$ws" -eq 1 ]; then
    echo "Transpiling WS version of $exchange_name "
    npm run tsBuildFile ts/src/pro/$exchange_name.ts &
    node build/transpileWs.js $exchange_name --ws &
    tsx build/csharpTranspiler.ts $exchange_name --ws &
    wait
else
    echo "Transpiling REST version of $exchange_name"
    npm run tsBuildFile ts/src/$exchange_name.ts &
    node build/transpile.js $exchange_name &
    tsx build/csharpTranspiler.ts $exchange_name &
    wait
fi

#build the c# project
dotnet build cs/ccxt/ccxt.csproj
