#!/usr/bin/env bash

build_all_and_exit () {
  npm run force-build
  npm run test-base
  npm run test-base-ws
  exit
}

### CHECK IF THIS IS A PR ###
if [ "$TRAVIS_PULL_REQUEST" = "false" ]; then
  echo "not a PR, will build everything"
  build_all_and_exit
fi

##### DETECT CHANGES #####
rest_pattern='ts\/src\/([A-Za-z0-9_-]+).ts' # \w not working for some reason
ws_pattern='ts\/src\/pro\/([A-Za-z0-9_-]+)\.ts'
diff=$(git diff origin/master --name-only)

readarray -t y <<<"$diff"

REST_EXCHANGES=()
WS_EXCHANGES=()
test_all=false
for file in "${y[@]}"; do
  if [[ "$file" =~ $rest_pattern ]]; then
    modified_exchange="${BASH_REMATCH[1]}"
    REST_EXCHANGES+=($modified_exchange)
  elif [[ "$file" =~ $ws_pattern ]]; then
    modified_exchange="${BASH_REMATCH[1]}"
    WS_EXCHANGES+=($modified_exchange)
  else
    if [[ "$file" != "build.sh" && "$file" != ".travis.yml" ]]; then
      echo "detected non derived file: $file, will build all"
      unset $test_all
      test_all=true
      break
    fi
  fi
done
##### END DETECT CHANGES #####

### RUN REGULAR BUILD SCRIPT AND EXIT IF NEEDED ###
if [[ "$test_all" = true ]]; then
  build_all_and_exit
fi

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