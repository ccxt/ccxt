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
    if [ -z "$rest_args" ] || { [ -n "$rest_args" ] && [ "$rest_args" != "skip" ]; }; then
      # shellcheck disable=SC2086
      node test-commonjs.cjs && node run-tests --js --python-async --php-async $rest_args &
      local rest_pid=$!
    fi
  fi
  if [ -z "$ws_pid" ]; then
    if [ -z "$ws_args" ] || { [ -n "$ws_args" ] && [ "$ws_args" != "skip" ]; }; then
      # shellcheck disable=SC2086
	  echo "WS ARGS"
	  # echo $ws_args
      node run-tests --ws --js $ws_args --info &
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
 


##### DETECT CHANGES #####
# in appveyor, there is no origin/master locally, so we need to fetch it.
if [[ "$IS_TRAVIS" != "TRUE" ]]; then
  git remote set-branches origin 'master'
  git fetch --depth=1 --no-tags
fi

diff=$(git diff origin/master --name-only)
# temporarily remove the below scripts from diff
diff=$(echo "$diff" | sed -e "s/^build\.sh//")
diff=$(echo "$diff" | sed -e "s/^skip\-tests\.json//")
diff=$(echo "$diff" | sed -e "s/^ts\/src\/test\/static.*json//") #remove static tests and markets
# diff=$(echo "$diff" | sed -e "s/^\.travis\.yml//")
# diff=$(echo "$diff" | sed -e "s/^package\-lock\.json//")
# diff=$(echo "$diff" | sed -e "s/python\/qa\.py//")
#echo $diff


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

WS_EXCHANGES+=('bitget')

### BUILD SPECIFIC EXCHANGES ###
# faster version of pre-transpile (without bundle and atomic linting)
npm run export-exchanges && npm run tsBuild && npm run emitAPI

# check return types
# npm run validate-types ${REST_EXCHANGES[*]}


echo "$msgPrefix WS_EXCHANGES TO BE TRANSPILED: ${WS_EXCHANGES[*]}"
for exchange in "${WS_EXCHANGES[@]}"; do
  npm run eslint "ts/src/pro/$exchange.ts"
  node build/transpileWS.js $exchange --force --child
  # PYTHON_FILES+=("python/ccxt/pro/$exchange.py")
done
# faster version of post-transpile
# npm run check-php-syntax

# only run the python linter if exchange related files are changed
if [ ${#PYTHON_FILES[@]} -gt 0 ]; then
  echo "$msgPrefix Linting python files: ${PYTHON_FILES[*]}"
  # ruff "${PYTHON_FILES[@]}"
fi


### RUN SPECIFIC TESTS (ONLY IN TRAVIS) ###
if [[ "$IS_TRAVIS" != "TRUE" ]]; then
  exit
fi
if [ ${#REST_EXCHANGES[@]} -eq 0 ] && [ ${#WS_EXCHANGES[@]} -eq 0 ]; then
  echo "$msgPrefix no exchanges to test, exiting"
  exit
fi

# run base tests (base js,py,php, brokerId and static-tests)
# npm run test-base

# rest_args=${REST_EXCHANGES[*]} || "skip"
rest_args=$(IFS=" " ; echo "${REST_EXCHANGES[*]}") || "skip"
# ws_args=${WS_EXCHANGES[*]} || "skip"
ws_args=$(IFS=" " ; echo "${WS_EXCHANGES[*]}") || "skip"

run_tests "$rest_args" "$ws_args"
