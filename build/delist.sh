#!/bin/sh

# Delist an exchange by removing all associated files from git.
# Usage: ./build/delist.sh <exchange_name>
# Example: ./build/delist.sh arkham

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <exchange_name>"
    echo "Example: $0 arkham"
    exit 1
fi

EXCHANGE="$1"

# always operate from the repo root, regardless of where the script is invoked from
cd "$(dirname "$0")/.."

# capitalize the first letter for Java class names (POSIX replacement for ${EXCHANGE:0:1}/${EXCHANGE:1})
FIRST=$(printf '%s' "$EXCHANGE" | cut -c1 | tr '[:lower:]' '[:upper:]')
REST=$(printf '%s' "$EXCHANGE" | cut -c2-)
CAPITALIZED="${FIRST}${REST}"

echo "Delisting exchange: $EXCHANGE"

while IFS= read -r file; do
    # skip blank lines and comments
    case "$file" in
        ''|'#'*) continue ;;
    esac
    if [ -e "$file" ] || git ls-files --error-unmatch "$file" >/dev/null 2>&1; then
        echo "  git rm $file"
        git rm -f "$file"
    else
        echo "  skip $file (not found)"
    fi
done <<EOF
# TypeScript source
ts/src/${EXCHANGE}.ts
ts/src/pro/${EXCHANGE}.ts
ts/src/abstract/${EXCHANGE}.ts
# Static test fixtures
ts/src/test/static/currencies/${EXCHANGE}.json
ts/src/test/static/markets/${EXCHANGE}.json
ts/src/test/static/request/${EXCHANGE}.json
ts/src/test/static/response/${EXCHANGE}.json
# JavaScript (tsc output)
js/src/${EXCHANGE}.js
js/src/${EXCHANGE}.d.ts
js/src/pro/${EXCHANGE}.js
js/src/pro/${EXCHANGE}.d.ts
js/src/abstract/${EXCHANGE}.js
js/src/abstract/${EXCHANGE}.d.ts
# dist (CJS build)
dist/cjs/src/${EXCHANGE}.js
dist/cjs/src/pro/${EXCHANGE}.js
dist/cjs/src/abstract/${EXCHANGE}.js
# Python
python/ccxt/${EXCHANGE}.py
python/ccxt/async_support/${EXCHANGE}.py
python/ccxt/pro/${EXCHANGE}.py
python/ccxt/abstract/${EXCHANGE}.py
# PHP
php/${EXCHANGE}.php
php/async/${EXCHANGE}.php
php/pro/${EXCHANGE}.php
php/abstract/${EXCHANGE}.php
php/async/abstract/${EXCHANGE}.php
# C#
cs/ccxt/api/${EXCHANGE}.cs
cs/ccxt/exchanges/${EXCHANGE}.cs
cs/ccxt/exchanges/pro/${EXCHANGE}.cs
cs/ccxt/exchanges/pro/wrappers/${EXCHANGE}.cs
cs/ccxt/wrappers/${EXCHANGE}.cs
# Go
go/v4/${EXCHANGE}.go
go/v4/${EXCHANGE}_api.go
go/v4/${EXCHANGE}_wrapper.go
go/v4/pro/${EXCHANGE}.go
go/v4/pro/${EXCHANGE}_wrapper.go
# Java
java/lib/src/main/java/io/github/ccxt/api/${CAPITALIZED}Api.java
java/lib/src/main/java/io/github/ccxt/exchanges/${CAPITALIZED}.java
java/lib/src/main/java/io/github/ccxt/exchanges/${CAPITALIZED}Core.java
java/lib/src/main/java/io/github/ccxt/exchanges/pro/${CAPITALIZED}.java
java/lib/src/main/java/io/github/ccxt/exchanges/pro/${CAPITALIZED}Core.java
EOF

echo ""
echo "Done. Review with: git status"