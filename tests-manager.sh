#!/usr/bin/env bash

if [ $# -lt 1 ]; then
  echo "too few arguments"
  exit 1
fi

timestamp_file="./last-run.txt"
now=$(date -u +%s)
last_run=$(< $timestamp_file)
delta=$((now - last_run))
six_hours=$((60 * 60 * 6))
diff=$(git diff HEAD --name-only)

if [ "$delta" -gt $six_hours ] || grep -q -E 'Exchange.php|/test|/base|^build|static_dependencies|^run-tests' <<< "$diff"; then
  command="node $*"
  echo "tests-managers: running $command in $(pwd)"
  if eval "$command"; then
    echo "Saving new timestamp"
    date -u +%s > "$timestamp_file"
  else
    exit 1
  fi
else
  to_test=$(sed -E -n 's:^js/(.+)\.js$:\1:p' <<< "$diff" | xargs)
  command="node $* $to_test"
  echo "tests-managers: running $command in $(pwd)"
  eval "$command"
  exit $?
fi
