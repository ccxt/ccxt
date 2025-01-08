#!/bin/bash

# Check for provided arguments
if [ "$#" -lt 1 ]; then
    echo "Usage: $0 [args...]"
    exit 1
fi

# Combine arguments into a single string
ARGS="$@"

# Run the command twice in the background
echo "Running 'npm run live-tests $ARGS' Rest and WS tests in parallel..."

npm run live-tests -- $ARGS &
PID1=$! # Store the PID of the first background process

npm run live-tests-ws -- $ARGS &
PID2=$! # Store the PID of the second background process

wait $PID1
STATUS1=$?

wait $PID2
STATUS2=$?

if [ $STATUS1 -eq 0 ] && [ $STATUS2 -eq 0 ]; then
    echo "Both 'npm run live-tests --$ARGS' completed successfully."
    exit 0
else
    echo "One or both 'npm run live-tests $ARGS' commands failed."
    exit 1
fi
