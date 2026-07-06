#!/usr/bin/env bash

# Delist an exchange by removing all associated files from git.
# Usage: ./delist-exchange.sh <exchange_name>
# Example: ./delist-exchange.sh arkham

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <exchange_name>"
    echo "Example: $0 arkham"
    exit 1
fi

EXCHANGE="$1"

echo "Delisting exchange: $EXCHANGE"

files=(
    # TypeScript source
    "ts/src/${EXCHANGE}.ts"
    "ts/src/pro/${EXCHANGE}.ts"
    "ts/src/abstract/${EXCHANGE}.ts"
    # Static test fixtures
    "ts/src/test/static/currencies/${EXCHANGE}.json"
    "ts/src/test/static/markets/${EXCHANGE}.json"
    "ts/src/test/static/request/${EXCHANGE}.json"
    "ts/src/test/static/response/${EXCHANGE}.json"
    # JavaScript (tsc output)
    "js/src/${EXCHANGE}.js"
    "js/src/${EXCHANGE}.d.ts"
    "js/src/pro/${EXCHANGE}.js"
    "js/src/pro/${EXCHANGE}.d.ts"
    "js/src/abstract/${EXCHANGE}.js"
    "js/src/abstract/${EXCHANGE}.d.ts"
    # dist (CJS build)
    "dist/cjs/src/${EXCHANGE}.js"
    "dist/cjs/src/pro/${EXCHANGE}.js"
    "dist/cjs/src/abstract/${EXCHANGE}.js"
    # Python
    "python/ccxt/${EXCHANGE}.py"
    "python/ccxt/async_support/${EXCHANGE}.py"
    "python/ccxt/pro/${EXCHANGE}.py"
    "python/ccxt/abstract/${EXCHANGE}.py"
    # PHP
    "php/${EXCHANGE}.php"
    "php/async/${EXCHANGE}.php"
    "php/pro/${EXCHANGE}.php"
    "php/abstract/${EXCHANGE}.php"
    "php/async/abstract/${EXCHANGE}.php"
    # C#
    "cs/ccxt/api/${EXCHANGE}.cs"
    "cs/ccxt/exchanges/${EXCHANGE}.cs"
    "cs/ccxt/exchanges/pro/${EXCHANGE}.cs"
    "cs/ccxt/exchanges/pro/wrappers/${EXCHANGE}.cs"
    "cs/ccxt/wrappers/${EXCHANGE}.cs"
    # Go
    "go/v4/${EXCHANGE}.go"
    "go/v4/${EXCHANGE}_api.go"
    "go/v4/${EXCHANGE}_wrapper.go"
    "go/v4/pro/${EXCHANGE}.go"
    "go/v4/pro/${EXCHANGE}_wrapper.go"
    # Java
    "java/lib/src/main/java/io/github/ccxt/api/$(echo ${EXCHANGE:0:1} | tr '[:lower:]' '[:upper:]')${EXCHANGE:1}Api.java"
    "java/lib/src/main/java/io/github/ccxt/exchanges/$(echo ${EXCHANGE:0:1} | tr '[:lower:]' '[:upper:]')${EXCHANGE:1}.java"
    "java/lib/src/main/java/io/github/ccxt/exchanges/$(echo ${EXCHANGE:0:1} | tr '[:lower:]' '[:upper:]')${EXCHANGE:1}Core.java"
    "java/lib/src/main/java/io/github/ccxt/exchanges/pro/$(echo ${EXCHANGE:0:1} | tr '[:lower:]' '[:upper:]')${EXCHANGE:1}.java"
    "java/lib/src/main/java/io/github/ccxt/exchanges/pro/$(echo ${EXCHANGE:0:1} | tr '[:lower:]' '[:upper:]')${EXCHANGE:1}Core.java"
)

for file in "${files[@]}"; do
    if [ -e "$file" ] || git ls-files --error-unmatch "$file" >/dev/null 2>&1; then
        echo "  git rm $file"
        git rm -f "$file"
    else
        echo "  skip $file (not found)"
    fi
done

echo ""
echo "Done. Review with: git status"
