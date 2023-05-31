#!/usr/bin/env bash
set -e

if [ "${BASH_VERSION:0:1}" -lt 4 ]; then
  echo "EPROGMISMATCH: bash version must be at least 4" >&2
  exit 75
fi

if [ $# -gt 0 ]; then
  echo "E2BIG: too many arguments" >&2
  exit 7
fi

[[ -n "$TRAVIS_BUILD_ID" ]] && IS_TRAVIS="TRUE" || IS_TRAVIS="FALSE"

msgPrefix="⬤ BUILD.SH : "

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
  if [[ "$IS_TRAVIS" == "TRUE" ]]; then
    npm run test-base
    npm run test-base-ws
    run_tests
  fi
  exit
}

### CHECK IF THIS IS A PR ###
# for appveyor, when PR is from fork, APPVEYOR_REPO_BRANCH is "master" and "APPVEYOR_PULL_REQUEST_HEAD_REPO_BRANCH" is branch name. if PR is from same repo, only APPVEYOR_REPO_BRANCH is set (and it is branch name)
if ([[ "$IS_TRAVIS" == "TRUE" ]] && [ "$TRAVIS_PULL_REQUEST" = "false" ]) || ([[ "$IS_TRAVIS" != "TRUE" ]] && [ -z "$APPVEYOR_PULL_REQUEST_HEAD_REPO_BRANCH" ]); then
  echo "$msgPrefix This is a master commit (not a PR), will build everything"
  build_and_test_all
fi

##### DETECT CHANGES #####
# in appveyor, there is no origin/master locally, so we need to fetch it
if [[ "$IS_TRAVIS" != "TRUE" ]]; then
  git remote set-branches origin 'master'
  git fetch --depth=1 --no-tags
fi

diff=$(git diff origin/master --name-only)
# temporarily remove the below scripts from diff
diff=$(echo "$diff" | sed -e "s/^build\.sh//")
diff=$(echo "$diff" | sed -e "s/^\.travis\.yml//")
diff=$(echo "$diff" | sed -e "s/^appveyor\.yml//")
diff=$(echo "$diff" | sed -e "s/^package\.json//")
diff=$(echo "$diff" | sed -e "s/^package\-lock\.json//")
diff=$(echo "$diff" | sed -e "s/python\/qa\.py//")
diff=$(echo "$diff" | sed -e "s/python\/tox\.ini//")
#echo $diff

critical_pattern='Client(Trait)?\.php|Exchange\.php|\/base|^build|static_dependencies|^run-tests|package(-lock)?\.json|composer\.json|ccxt\.ts|__init__.py' # add \/test|
if [[ "$diff" =~ $critical_pattern ]]; then
  echo "$msgPrefix Important changes detected - doing full build & test"
  build_and_test_all
fi

echo "$msgPrefix Unimportant changes detected - build & test only specific exchange(s)"
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
# faster version of pre-transpile (without bundle and atomic linting)
npm run export-exchanges && npm run tsBuild && npm run emitAPI


echo "$msgPrefix REST_EXCHANGES TO BE TRANSPILED: ${REST_EXCHANGES[@]}"
PYTHON_FILES=()
for exchange in "${REST_EXCHANGES[@]}"; do
  npm run eslint "ts/src/$exchange.ts"
  node build/transpile.js $exchange --force --child
  PYTHON_FILES+=("python/ccxt/$exchange.py")
  PYTHON_FILES+=("python/ccxt/async_support/$exchange.py")
done
echo "$msgPrefix WS_EXCHANGES TO BE TRANSPILED: ${WS_EXCHANGES[@]}"
for exchange in "${WS_EXCHANGES[@]}"; do
  npm run eslint "ts/src/pro/$exchange.ts"
  node build/transpileWS.js $exchange --force --child
  PYTHON_FILES+=("python/ccxt/pro/$exchange.py")
done
# faster version of post-transpile
npm run check-php-syntax
cd python && tox -e qa -- ${PYTHON_FILES[*]} && cd ..


### RUN SPECIFIC TESTS (ONLY IN TRAVIS) ###
if [[ "$IS_TRAVIS" != "TRUE" ]]; then
  exit
fi
if [ ${#REST_EXCHANGES[@]} -eq 0 ] && [ ${#WS_EXCHANGES[@]} -eq 0 ]; then
  echo "$msgPrefix no exchanges to test, exiting"
  exit
fi

# rest_args=${REST_EXCHANGES[*]} || "skip"
rest_args=$(IFS=" " ; echo "${REST_EXCHANGES[*]}") || "skip"
# ws_args=${WS_EXCHANGES[*]} || "skip"
ws_args=$(IFS=" " ; echo "${WS_EXCHANGES[*]}") || "skip"

run_tests "$rest_args" "$ws_args"