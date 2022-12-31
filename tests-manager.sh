#!/usr/bin/env bash

if [ $# -gt 0 ]; then
  echo "E2BIG: too many arguments"
  exit 7
fi

timestamp_file="$TRAVIS_BUILD_DIR/.cache/last-run.txt"
if ! [ -f "$timestamp_file" ]; then
  echo "file not found"
  echo '0' > "$timestamp_file"
fi

now=$(date -u +%s)
last_run=$(< "$timestamp_file")
delta=$((now - last_run))
six_hours=$((60 * 60 * 6))
diff=$(git diff master --name-only)
echo "$last_run"
git log -2 --format=%H
git show -s --format=%H HEAD
git show -s --format=%H "$TRAVIS_COMMIT"

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

if [ "$TRAVIS_PULL_REQUEST" = "false" ] && [ "$TRAVIS_BRANCH" = "master" ] && git show -s --format=%ce HEAD~1 | grep -q 'travis@travis-ci.org'; then
  # we are in a merge commit
  # the first parent is a release made by travis
  # this means the tests are passing and there have been no untested pushes
  exit 0
fi

if [ "$delta" -gt $six_hours ] || grep -q -E 'Exchange.php|/test|/base|^build|static_dependencies|^run-tests' <<< "$diff"; then
  # shellcheck disable=SC2155
  run_tests && date -u +%s > "$timestamp_file"
else
  run_tests "$(sed -E -n 's:^js/([^/]+)\.js$:\1:p' <<< "$diff" | xargs)" "$(sed -E -n 's:^js/pro/([^/]+)\.js$:\1:p' <<< "$diff" | xargs)"
fi
