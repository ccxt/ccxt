#!/usr/bin/env bash

if [ "${BASH_VERSION:0:1}" -lt 4 ]; then
  echo "EPROGMISMATCH: bash version must be at least 4" >&2
  exit 75
fi

if [ $# -gt 0 ]; then
  echo "E2BIG: too many arguments" >&2
  exit 7
fi

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
    if [[ -z "$rest_args" ]] || { [[ -n "$rest_args" ]] && [[ $rest_args != "skip" ]]; }; then
      # shellcheck disable=SC2086
      node test-commonjs.cjs && node run-tests --js --python-async --php-async $rest_args &
      local rest_pid=$!
    fi
  fi
  if [ -z "$ws_pid" ]; then
    if [[ -z "$ws_args" ]] || { [[ -n "$ws_args" ]] && [[ $ws_args != "skip" ]]; }; then
      # shellcheck disable=SC2086
      node run-tests-ws --js --python-async --php-async $ws_args &
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
diff=$(git diff origin/master --name-only)
diff=$(echo "$diff" | sed -e "s/^build.sh//") # temporarily remove this script from diff
diff=$(echo "$diff" | sed -e "s/^package.json//") # temporarily remove this script from diff
diff=$(echo "$diff" | sed -e "s/python\/qa.py//") # temporarily remove this script from diff
diff=$(echo "$diff" | sed -e "s/python\/tox.ini//") # temporarily remove this script from diff

critical_pattern='Client(Trait)?\.php|Exchange\.php|\/test|\/base|^build|static_dependencies|^run-tests|package(-lock)?\.json|ccxt\.ts|__init__.py'
if [[ "$diff" =~ $critical_pattern ]]; then
  echo "detected critical change, will build/test everything"
  build_and_test_all
fi

echo "detected non-critical change, will build/test specific exchanges"
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
# npm run pre-transpile
# faster version of pre-transpile (without bundle and atomic linting)
npm run export-exchanges && npm run tsBuild && npm run emitAPI
echo "REST_EXCHANGES TO BE TRANSPILED: ${REST_EXCHANGES[@]}"
PYTHON_FILES=()
for exchange in "${REST_EXCHANGES[@]}"; do
  npm run eslint "ts/src/$exchange.ts"
  node build/transpile.js $exchange --force --child
  PYTHON_FILES+=("python/ccxt/$exchange.py")
  PYTHON_FILES+=("python/ccxt/async_support/$exchange.py")
done
echo "WS_EXCHANGES TO BE TRANSPILED: ${WS_EXCHANGES[@]}"
for exchange in "${WS_EXCHANGES[@]}"; do
  npm run eslint "ts/src/pro/$exchange.ts"
  node build/transpileWS.js $exchange --force --child
  PYTHON_FILES+=("python/ccxt/pro/$exchange.py")
done
# faster version of post-transpile
npm run check-php-syntax
cd python && tox -e qa -- ${PYTHON_FILES[*]} && cd ..

### RUN SPECIFIC TESTS ###
if [  ${#REST_EXCHANGES[@]} -eq 0 ] && [ ${#WS_EXCHANGES[@]} -eq 0 ]; then
  echo "no exchanges to test, exiting"
  exit
fi

# rest_args=${REST_EXCHANGES[*]} || "skip"
rest_args=$(IFS=" " ; echo "${REST_EXCHANGES[*]}") || "skip"
# ws_args=${WS_EXCHANGES[*]} || "skip"
ws_args=$(IFS=" " ; echo "${WS_EXCHANGES[*]}") || "skip"

run_tests "$rest_args" "$ws_args"