#!/usr/bin/env bash

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
    node test-commonjs.cjs && node run-tests --js --python-async --php-async $rest_args &
    local rest_pid=$!
  fi
  if [ -z "$ws_pid" ]; then
    # shellcheck disable=SC2086
    node run-tests-ws --js --python-async --php-async $ws_args &
    local ws_pid=$!
  fi
  wait $rest_pid && wait $ws_pid
}

build_and_test_all () {
  npm run force-build
  npm run test-base
  npm run test-base-ws
  run_tests
  exit
}

### CHECK IF THIS IS A PR ###
if [ "$TRAVIS_PULL_REQUEST" = "false" ]; then
  echo "not a PR, will build everything"
  build_and_test_all
fi

##### DETECT CHANGES #####
diff=$(git diff upstream/master --name-only)

critical_pattern='Client(Trait)?\.php$|Exchange\.php$|\/test|\/base|^build|static_dependencies|^run-tests|package(-lock)?\.json|ccxt\.ts$'
if [[ "$diff" =~ $critical_pattern ]]; then
  echo "detected critical change, will build/test everything"
  build_and_test_all
fi

echo "detected non-critical change, will build/test specific exchanges"
exit
readarray -t y <<<"$diff"
rest_pattern='ts\/src\/([A-Za-z0-9_-]+).ts' # \w not working for some reason
ws_pattern='ts\/src\/pro\/([A-Za-z0-9_-]+)\.ts'

REST_EXCHANGES=()
WS_EXCHANGES=()
for file in "${y[@]}"; do
  if [[ "$file" =~ $rest_pattern ]]; then
    modified_exchange="${BASH_REMATCH[1]}"
    REST_EXCHANGES+=($modified_exchange)
  elif [[ "$file" =~ $ws_pattern ]]; then
    modified_exchange="${BASH_REMATCH[1]}"
    WS_EXCHANGES+=($modified_exchange)
  fi
done

### BUILD SPECIFIC EXCHANGES ###
npm run pre-transpile
echo "REST_EXCHANGES TO BE TRANSPILED: ${REST_EXCHANGES[@]}"
for exchange in "${REST_EXCHANGES[@]}"; do
  node build/transpile.js $exchange --force --child
done
echo "WS_EXCHANGES TO BE TRANSPILED: ${WS_EXCHANGES[@]}"
for exchange in "${WS_EXCHANGES[@]}"; do
  node build/transpileWS.js $exchange --force --child
done
npm run post-transpile

### RUN SPECIFIC TESTS ###
run_tests "${REST_EXCHANGES[*]}" "${WS_EXCHANGES[*]}"