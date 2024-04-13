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
[[ "$RUNSTEP" == "PY_JS_PHP" ]] && IS_PYJSPHP="TRUE" || IS_PYJSPHP="FALSE"

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
      if [ "$IS_PYJSPHP" == "TRUE" ]; then
        npm run test-pyjsphp -- $rest_args &
      else
        npm run test-cs -- $rest_args &
      fi
      local rest_pid=$!
    fi
  fi
  if [ -z "$ws_pid" ]; then
    if [ -z "$ws_args" ] || { [ -n "$ws_args" ] && [ "$ws_args" != "skip" ]; }; then
      # shellcheck disable=SC2086
      if [ "$IS_PYJSPHP" == "TRUE" ]; then
        npm run test-pyjsphp-ws $ws_args &
      else
        npm run test-cs-ws $ws_args &
      fi
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
  if [ "$IS_PYJSPHP" == "TRUE" ]; then
    npm run force-build-pyjsphp
  else
    npm run force-build-cs
  fi
  if [ "$IS_TRAVIS" = "TRUE" ]; then
    merged_pull_request="$(git show --format="%s" -s HEAD | sed -nE 's/Merge pull request #([0-9]{5}).+$/\1/p')"
    echo "DEBUG: $merged_pull_request" # for debugging
    if [ -n "$merged_pull_request" ]; then
      echo "Travis is building merge commit #$merged_pull_request"
      # run every 3 merged pull requests
      # if [ $(("${merged_pull_request:0-1}" % 3)) -eq 0 ]; then
      #   # update pyenv
      #   (cd "$(pyenv root)" && git pull -q origin master)
      #   # install python interpreters
      #   pyenv install -s 3.7.17
      #   pyenv install -s 3.8.18
      #   pyenv install -s 3.9.18
      #   pyenv install -s 3.10.13
      #   pyenv install -s 3.11.6
      #   pyenv global 3.7 3.8 3.9 3.10 3.11
      #   cd python
      #   if ! tox run-parallel; then
      #     exit 1
      #   fi
      #   cd  ..
      # fi
    fi
    if [ "$IS_PYJSPHP" == "TRUE" ]; then
      npm run test-base-pyjsphp
      npm run test-base-ws-pyjsphp
    else
      npm run test-base-cs
      npm run test-base-ws-cs
    fi
    last_commit_message=$(git log -1 --pretty=%B)
    echo "Last commit: $last_commit_message" # for debugging
    if [[ "$last_commit_message" == *"skip-tests"* ]]; then
        echo "[SKIP-TESTS] Will skip tests!"
        exit
    fi
    run_tests
  fi
  exit
}

### CHECK IF THIS IS A PR ###
# for appveyor, when PR is from fork, APPVEYOR_REPO_BRANCH is "master" and "APPVEYOR_PULL_REQUEST_HEAD_REPO_BRANCH" is branch name. if PR is from same repo, only APPVEYOR_REPO_BRANCH is set (and it is branch name)
if { [ "$IS_TRAVIS" = "TRUE" ] && [ "$TRAVIS_PULL_REQUEST" = "false" ]; } || { [ "$IS_TRAVIS" != "TRUE" ] && [ -z "$APPVEYOR_PULL_REQUEST_HEAD_REPO_BRANCH" ]; }; then

  echo "$msgPrefix This is a master commit (not a PR), will build everything"
  build_and_test_all
fi

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

critical_pattern='Client(Trait)?\.php|Exchange\.php|\/base|^build|static_dependencies|^run-tests|package(-lock)?\.json|composer\.json|ccxt\.ts|__init__.py|test' # add \/test|
if [[ "$diff" =~ $critical_pattern ]]; then
  echo "$msgPrefix Important changes detected - doing full build & test"
  echo "$diff"
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

# check return types
npm run validate-types ${REST_EXCHANGES[*]}

echo "$msgPrefix REST_EXCHANGES TO BE TRANSPILED: ${REST_EXCHANGES[*]}"
PYTHON_FILES=()
for exchange in "${REST_EXCHANGES[@]}"; do
  if [ "$IS_PYJSPHP" == "TRUE" ]; then
    npm run eslint "ts/src/$exchange.ts"
    node build/transpile.js $exchange --force --child
    PYTHON_FILES+=("python/ccxt/$exchange.py")
    PYTHON_FILES+=("python/ccxt/async_support/$exchange.py")
  else
    node --loader ts-node/esm build/csharpTranspiler.ts $exchange
  fi
done
echo "$msgPrefix WS_EXCHANGES TO BE TRANSPILED: ${WS_EXCHANGES[*]}"
for exchange in "${WS_EXCHANGES[@]}"; do
  if [ "$IS_PYJSPHP" == "TRUE" ]; then
    npm run eslint "ts/src/pro/$exchange.ts"
    node build/transpileWS.js $exchange --force --child
    PYTHON_FILES+=("python/ccxt/pro/$exchange.py")
  else
    node --loader ts-node/esm build/csharpTranspiler.ts $exchange --ws
  fi
done
# faster version of post-transpile

if [ "$IS_PYJSPHP" == "TRUE" ]; then
  npm run check-php-syntax
fi

# only run the python linter if exchange related files are changed
if [ ${#PYTHON_FILES[@]} -gt 0 ]; then
  echo "$msgPrefix Linting python files: ${PYTHON_FILES[*]}"
  ruff "${PYTHON_FILES[@]}"
fi


### RUN SPECIFIC TESTS (ONLY IN TRAVIS) ###
if [[ "$IS_TRAVIS" != "TRUE" ]]; then
  exit
fi
if [ ${#REST_EXCHANGES[@]} -eq 0 ] && [ ${#WS_EXCHANGES[@]} -eq 0 ]; then
  echo "$msgPrefix no exchanges to test, exiting"
  exit
fi

if [ "$IS_PYJSPHP" == "TRUE" ]; then
  # build dotnet project
  npm run buildCS && npm run id-tests-cs
else
  # run base tests (base js,py,php, brokerId )
  # npm run test-base
  npm run test-js-base && npm run test-python-base && npm run test-php-base && npm run id-tests-pyjsphp
fi

# rest_args=${REST_EXCHANGES[*]} || "skip"
rest_args=$(IFS=" " ; echo "${REST_EXCHANGES[*]}") || "skip"
# ws_args=${WS_EXCHANGES[*]} || "skip"
ws_args=$(IFS=" " ; echo "${WS_EXCHANGES[*]}") || "skip"


#request static tests
for exchange in "${REST_EXCHANGES[@]}"; do
  if [ "$IS_PYJSPHP" == "TRUE" ]; then
    npm run request-js -- $exchange
    npm run request-py -- $exchange
    php php/test/test_async.php $exchange --requestTests
  else
    npm run request-cs -- $exchange
  fi
done

#response static tests
for exchange in "${REST_EXCHANGES[@]}"; do
  if [ "$IS_PYJSPHP" == "TRUE" ]; then
    npm run response-js -- $exchange
    npm run response-py -- $exchange
    php php/test/test_async.php $exchange --responseTests
  else
    npm run response-cs -- $exchange
  fi
done

run_tests "$rest_args" "$ws_args"
