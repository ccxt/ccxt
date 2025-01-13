#!/bin/bash

# Check for provided arguments
if [ "$#" -lt 1 ]; then
    echo "Usage: $0 [args...]"
    exit 1
fi

function run_all {
    local lang="$1"
    # Run the command twice in the background
    echo "Running all 'npm run live-tests $lang' Rest and WS tests in parallel..."

    npm run live-tests -- $lang &
    PID1=$! # Store the PID of the first background process

    npm run live-tests-ws -- $lang &
    PID2=$! # Store the PID of the second background process

    wait $PID1
    STATUS1=$?

    wait $PID2
    STATUS2=$?

    if [ $STATUS1 -eq 0 ] && [ $STATUS2 -eq 0 ]; then
        echo "Both 'npm run live-tests --$lang' completed successfully."
        exit 0
    else
        echo "One or both 'npm run live-tests $lang' commands failed."
        exit 1
    fi

}

function run_specific_tests {
  local rest_args=
  local ws_args=
  local lang=
  if [ $# -eq 3 ]; then
    lang="$1"
    rest_args="$2"
    ws_args="$3"
    # echo "inside rest_args: $rest_args"
    # echo "inside ws_args: $ws_args"
    if [ -z "$rest_args" ]; then
      : &
      local rest_pid=$!
    fi
    if [ -z "$ws_args" ]; then
      : &
      local ws_pid=$!
    fi
  fi

  if [ -z "$rest_pid" ]; then
    if [ -z "$rest_args" ] || { [ -n "$rest_args" ] && [ "$rest_args" != "skip" ]; }; then
      # shellcheck disable=SC2086
      npm run live-tests -- $lang $rest_args &
      local rest_pid=$!
    fi
  fi
  if [ -z "$ws_pid" ]; then
    if [ -z "$ws_args" ] || { [ -n "$ws_args" ] && [ "$ws_args" != "skip" ]; }; then
      # shellcheck disable=SC2086
      npm run live-tests -- $lang --ws $ws_args &
      local ws_pid=$!
    fi
  fi

  if [ -n "$rest_pid" ] && [ -n "$ws_pid" ]; then
    wait $rest_pid && wait $ws_pid
  elif [ -n "$rest_pid" ]; then
    wait $rest_pid
  else
    wait $ws_pid
  fi
}



lang="$1"

if [ "$#" -lt 2 ]; then
    run_all "$lang"
else
    rest_exchanges="$2"
    ws_exchanges="$3"
    # echo "beofre calling run_specific_tests"
    # echo "rest_exchanges: $rest_exchanges"
    # echo "ws_exchanges: $ws_exchanges"
    run_specific_tests "$lang" "$rest_exchanges" "$ws_exchanges"
fi
