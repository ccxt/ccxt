#!/usr/bin/env bash

set -e

cd java/


if [ "$#" -gt 0 ]; then
    ./gradlew cli:run --args="$*"
else
    ./gradlew cli:run
fi

# Return to original directory
cd ..