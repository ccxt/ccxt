#!/usr/bin/env bash

set -e

cd java/

# Run the CLI with all passed arguments
./gradlew cli:run --args="$*"

# Return to original directory
cd ..