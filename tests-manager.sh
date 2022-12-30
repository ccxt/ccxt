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

set -x
if [ "$TRAVIS_PULL_REQUEST" = "false" ] && [ "$TRAVIS_BRANCH" = "master" ]; then
  # we are in a merge commit
  # the previous commit is either a direct push or a commit on another branch
  # if it is a direct push then the commit would be parent 1 otherwise the commit will be parent 2
  parents="$(git show -s --format=%P "$TRAVIS_COMMIT")"
  travis_number=$(xargs git show -s --format=%ce <<< "$parents" | grep -n 'travis@travis-ci.org')
  number=${travis_number:0:1}
  other_commit_index=$(( ((number - 1) ^ 1) + 1  ))
  other_commit_hash=$(cut -d ' ' -f$other_commit_index <<< "$parents")
  status=$(curl  -H "Accept: application/json"  -H "Authorization: Bearer $GITHUB_AUTH_TOKEN"  -H "X-GitHub-Api-Version: 2022-11-28" \
    "https://api.github.com/repos/ccxt/ccxt/commits/$(git show -s --format=%P "$other_commit_hash")/check-runs | jq '.check_runs[0].conclusion'")
  # we check the travis build status of the previous commit
  if [ "$status" = "completed" ]; then
    exit 0
  fi
fi
set +x

if [ "$delta" -gt $six_hours ] || grep -q -E 'Exchange.php|/test|/base|^build|static_dependencies|^run-tests' <<< "$diff"; then
  # shellcheck disable=SC2155
  run_tests && export LAST_RUN=$(date -u +%s)
else
  run_tests "$(sed -E -n 's:^js/([^/]+)\.js$:\1:p' <<< "$diff" | xargs)" "$(sed -E -n 's:^js/pro/([^/]+)\.js$:\1:p' <<< "$diff" | xargs)"
fi
