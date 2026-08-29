#!/bin/bash

if [ -z "$1" ]; then
    echo "Error: Missing required argument."
    echo "Usage: $0 ExchangeName"
    exit 1
fi

# export only the required exchange
npm run export-exchanges "$1"

# build ts to js
npm run tsBuild


MATCH="$1"

for DIR in js/src js/src/pro; do
    find "$DIR" -maxdepth 1 -type f ! -name "*$MATCH*" -exec rm -v {} \;
done