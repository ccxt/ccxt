#!/bin/bash

diff=$(git diff --name-only HEAD^1 HEAD)
diff=$(echo "$diff" | sed -e "s/^build\.sh//")
diff=$(echo "$diff" | sed -e "s/^skip\-tests\.json//")
diff=$(echo "$diff" | sed -e "s/^run\-tests\-simul\.sh//")
diff=$(echo "$diff" | sed -e "s/^\w+.yml//") # tmp remove actions files
diff_without_statics=$(echo "$diff" | sed -e "s/^ts\/src\/test\/static.*json//")

critical_pattern='Client(Trait)?\.php|Exchange\.php|\/base|^build|static_dependencies|^run-tests|composer\.json|ccxt\.ts|__init__.py|test' # add \/test| # remove package json temporatily todo revert this!!
# critical_pattern='Client(Trait)?\.php|Exchange\.php|\/base|^build|static_dependencies|^run-tests|package(-lock)?\.json|composer\.json|ccxt\.ts|__init__.py|test' # add \/test|

if [[ "$GITHUB_REF" == "refs/heads/master" ]]; then
    IMPORTANT_MODIFIED="true"
    # echo "$msgPrefix Running on master branch - doing full build & test"
elif [[ "$diff_without_statics" =~ $critical_pattern ]]; then
    IMPORTANT_MODIFIED="true"
    # echo "$msgPrefix Critial changes detected - doing full build & test"
else
    # echo "$msgPrefix Unimportant changes detected - build & test only specific exchange(s)"
    IMPORTANT_MODIFIED="false"
fi

# echo "$diff_without_statics"

if [ "$IMPORTANT_MODIFIED" == "true" ]; then
  echo "{\"important_modified\": \"$IMPORTANT_MODIFIED\", \"rest_exchanges\": [], \"ws_exchanges\": []}"
  exit
fi

readarray -t y <<<"$diff"
rest_pattern='ts\/src\/([A-Za-z0-9_-]+).ts' # \w not working for some reason
ws_pattern='ts\/src\/pro\/([A-Za-z0-9_-]+)\.ts'
pattern_static_request='ts\/src\/test\/static\/request\/([A-Za-z0-9_-]+)\.json'
pattern_static_response='ts\/src\/test\/static\/response\/([A-Za-z0-9_-]+)\.json'

REST_EXCHANGES=()
WS_EXCHANGES=()


# for file in "${y[@]}"; do
#   if [[ "$file" =~ $rest_pattern ]]; then
#     modified_exchange="${BASH_REMATCH[1]}"
#     REST_EXCHANGES+=($modified_exchange)
#   elif [[ "$file" =~ $pattern_static_request ]]; then
#     modified_exchange="${BASH_REMATCH[1]}"
#     REST_EXCHANGES+=($modified_exchange)
#   elif [[ "$file" =~ $pattern_static_response ]]; then
#     modified_exchange="${BASH_REMATCH[1]}"
#     REST_EXCHANGES+=($modified_exchange)
#   elif [[ "$file" =~ $ws_pattern ]]; then
#     modified_exchange="${BASH_REMATCH[1]}"
#     WS_EXCHANGES+=($modified_exchange)
#   fi
# done

for file in "${y[@]}"; do
  if [[ "$file" =~ $rest_pattern ]]; then
    modified_exchange="${BASH_REMATCH[1]}"
    if [[ ! " ${REST_EXCHANGES[@]} " =~ " ${modified_exchange} " ]]; then
      REST_EXCHANGES+=("$modified_exchange")
    fi
  elif [[ "$file" =~ $pattern_static_request ]]; then
    modified_exchange="${BASH_REMATCH[1]}"
    if [[ ! " ${REST_EXCHANGES[@]} " =~ " ${modified_exchange} " ]]; then
      REST_EXCHANGES+=("$modified_exchange")
    fi
  elif [[ "$file" =~ $pattern_static_response ]]; then
    modified_exchange="${BASH_REMATCH[1]}"
    if [[ ! " ${REST_EXCHANGES[@]} " =~ " ${modified_exchange} " ]]; then
      REST_EXCHANGES+=("$modified_exchange")
    fi
  elif [[ "$file" =~ $ws_pattern ]]; then
    modified_exchange="${BASH_REMATCH[1]}"
    if [[ ! " ${WS_EXCHANGES[@]} " =~ " ${modified_exchange} " ]]; then
      WS_EXCHANGES+=("$modified_exchange")
    fi
  fi
done

# echo "REST_EXCHANGES: ${REST_EXCHANGES[*]}"
# echo "WS_EXCHANGES: ${WS_EXCHANGES[*]}"

# echo "{\"important_modified\": \"$IMPORTANT_MODIFIED\", \"rest_exchanges\": \"${REST_EXCHANGES[*]}\", \"ws_exchanges\": \"${WS_EXCHANGES[*]}\"}"

# rest_exchanges_json=$(printf '%s\n' "${REST_EXCHANGES[@]}" | jq -R . | jq -s .)
# ws_exchanges_json=$(printf '%s\n' "${WS_EXCHANGES[@]}" | jq -R . | jq -s .)


if [ ${#REST_EXCHANGES[@]} -eq 0 ]; then
  rest_exchanges_json="[]"
else
  rest_exchanges_json=$(printf '%s\n' "${REST_EXCHANGES[@]}" | jq -R . | jq -s .)
fi

if [ ${#WS_EXCHANGES[@]} -eq 0 ]; then
  ws_exchanges_json="[]"
else
  ws_exchanges_json=$(printf '%s\n' "${WS_EXCHANGES[@]}" | jq -R . | jq -s .)
fi

echo "{\"important_modified\": \"$IMPORTANT_MODIFIED\", \"rest_exchanges\": $rest_exchanges_json, \"ws_exchanges\": $ws_exchanges_json}"