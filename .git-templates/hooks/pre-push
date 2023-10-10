#!/bin/bash


# Check if changes are relevant
CHECK_DIRECTORIES="ts/ python/ php/ build/"

MODIFIED_FILES=$(git diff --name-only upstream/master)
HAS_RELEVANT_CHANGES=false

for DIR in $CHECK_DIRECTORIES; do
    if echo "$MODIFIED_FILES" | grep -qE "^$DIR"; then
        HAS_RELEVANT_CHANGES=true
        break
    fi
done

if [ "$HAS_RELEVANT_CHANGES" = "false" ]; then
    echo "No relevant changes, skipping checks..."
    exit 0
fi

# Lint TS files
MODIFIED_TS_FILES=$(git diff --name-only upstream/master -- 'ts/**/*.ts')

# Run eslint on the modified files
if [ "$MODIFIED_TS_FILES" != "" ]; then
    eslint $MODIFIED_TS_FILES
fi


ESLINT_EXIT_CODE=$?

# Run python linting
ruff ./python/ccxt

PYTHON_EXIT_CODE=$?

# Run PHP linting
npm run check-php-syntax

PHP_EXIT_CODE=$?


exit $((ESLINT_EXIT_CODE + PYTHON_EXIT_CODE + PHP_EXIT_CODE))
