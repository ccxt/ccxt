#!/usr/bin/env bash

if [ $# -gt 0 ]; then
  echo "E2BIG: too many arguments"
  exit 7
fi

timestamp_file="./last-run.txt"
if ! [ -f "$timestamp_file" ]; then
  echo "ENOENT: file $timestamp_file not found"
  exit 2
fi

now=$(date -u +%s)
last_run=$(< $timestamp_file)
delta=$((now - last_run))
six_hours=$((60 * 60 * 6))
diff=$(git diff master --name-only)

function run_tests {
  local rest_args=
  local ws_args=
  if [ $# -eq 2 ]; then
    rest_args="$1"
    ws_args="$2"
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
    # shellcheck disable=SC2086
    node run-tests --js --python-async --php-async $rest_args &
    local rest_pid=$!
  fi
  if [ -z "$ws_pid" ]; then
    # shellcheck disable=SC2086
    node run-tests-ws --js --python-async --php-async $ws_args &
    local ws_pid=$!
  fi
  wait $rest_pid && wait $ws_pid
}

if [ "$TRAVIS_PULL_REQUEST" = "false" ] && [ "$TRAVIS_BRANCH" = "master" ]; then
  # if it is a direct push then the commit would be parent 1 otherwise the commit will be parent 2
  if git show -s --format=%ce "$TRAVIS_COMMIT^1" | grep -q 'travis@travis-ci.org'; then
    # we are in a merge commit
    # the previous commit is a release made by travis
    # instead of a direct push, so we can skip running the tests
    exit 0
  fi
fi

if [ "$delta" -gt $six_hours ] || grep -q -E 'Exchange.php|/test|/base|^build|static_dependencies|^run-tests' <<< "$diff"; then
  # shellcheck disable=SC2155
  run_tests && export LAST_RUN=$(date -u +%s)
else
  run_tests "$(sed -E -n 's:^js/([^/]+)\.js$:\1:p' <<< "$diff" | xargs)" "$(sed -E -n 's:^js/pro/([^/]+)\.js$:\1:p' <<< "$diff" | xargs)"
fi
