#!/usr/bin/env bash

if [ "${BASH_VERSION:0:1}" -lt 4 ]; then
  echo "EPROGMISMATCH: bash version must be at least 4" >&2
  exit 75
fi

if [ $# -gt 0 ]; then
  echo "E2BIG: too many arguments" >&2
  exit 7
fi

cache_path="$TRAVIS_BUILD_DIR/.cache"
if ! [ -d "$cache_path" ]; then
  echo "ENOENT: .cache not found" >&2
  exit 2
fi

timestamps_path="$cache_path/timestamps"
urls_path="$cache_path/urls"

# slug is of the form owner_name/repo_name
# our file name is of the form owner_name:remote_branch_name
if [ "$TRAVIS_PULL_REQUEST" = "false" ]; then
  slug="$TRAVIS_REPO_SLUG"
  branch="$TRAVIS_BRANCH"
else
  slug="$TRAVIS_PULL_REQUEST_SLUG"
  branch="$TRAVIS_PULL_REQUEST_BRANCH"
fi
cache_file_name="$(cut -d '/' -f1 <<< "$slug"):$(tr '/' '|' <<< "$branch")"

mkdir "$timestamps_path" 2> /dev/null
mkdir "$urls_path" 2> /dev/null

cached_timestamp_file="$timestamps_path/$cache_file_name.txt"
cached_url_file="$urls_path/$cache_file_name.txt"

if ! [ -f "$cached_timestamp_file" ]; then
  # we initialise the cached timestamp to the current time
  # even before running a successful build so that pull requests
  date +%s > "$cached_timestamp_file"
fi
last_run=$(< "$cached_timestamp_file")
if [ "$last_run" -ne "$last_run" ] 2> /dev/null; then
  # check that last run is an integer
  last_run=0
fi

now=$(date +%s)
delta=$((now - last_run))
six_hours=$((60 * 60 * 6))
diff=$(git diff master --name-only)

# begin debug
echo "$cached_timestamp_file"
echo "$cached_url_file"
echo "$diff"
# end debug

echo "last build url: $(cat "$cached_url_file" 2> /dev/null)"
echo "completed at: $(date -d "@$last_run" -u '+%H:%M on %B %d') - $((delta / 3600)) hours ago"

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
  wait $rest_pid && wait $ws_pid && echo "$TRAVIS_BUILD_WEB_URL" > "$cached_url_file"
}

if [ "$delta" -gt $six_hours ] || grep -q -E 'Client(Trait)?\.php$|Exchange\.php$|/test|/base|^build|static_dependencies|^run-tests|package(-lock)?\.json$' <<< "$diff"; then
  # shellcheck disable=SC2155
  run_tests && date +%s > "$cached_timestamp_file"
else
  run_tests "$(sed -E -n 's:^js/([^/]+)\.js$:\1:p' <<< "$diff" | xargs)" "$(sed -E -n 's:^js/pro/([^/]+)\.js$:\1:p' <<< "$diff" | xargs)"
fi
