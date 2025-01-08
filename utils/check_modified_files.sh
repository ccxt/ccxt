

diff=$(git diff --name-only HEAD^1 HEAD)
diff=$(echo "$diff" | sed -e "s/^build\.sh//")
diff=$(echo "$diff" | sed -e "s/^skip\-tests\.json//")
diff_without_statics=$(echo "$diff" | sed -e "s/^ts\/src\/test\/static.*json//")

critical_pattern='Client(Trait)?\.php|Exchange\.php|\/base|^build|static_dependencies|^run-tests|package(-lock)?\.json|composer\.json|ccxt\.ts|__init__.py|test' # add \/test|

if [[ "$diff_without_statics" =~ $critical_pattern ]]; then
    IMPORTANT_MODIFIED="true"
    # echo "$msgPrefix Critial changes detected - doing full build & test"
else
    # echo "$msgPrefix Unimportant changes detected - build & test only specific exchange(s)"
    IMPORTANT_MODIFIED="false"
fi

echo "$diff_without_statics"


readarray -t y <<<"$diff"
rest_pattern='ts\/src\/([A-Za-z0-9_-]+).ts' # \w not working for some reason
ws_pattern='ts\/src\/pro\/([A-Za-z0-9_-]+)\.ts'
pattern_static_request='ts\/src\/test\/static\/request\/([A-Za-z0-9_-]+)\.json'
pattern_static_response='ts\/src\/test\/static\/response\/([A-Za-z0-9_-]+)\.json'

REST_EXCHANGES=()
WS_EXCHANGES=()


for file in "${y[@]}"; do
  if [[ "$file" =~ $rest_pattern ]]; then
    modified_exchange="${BASH_REMATCH[1]}"
    REST_EXCHANGES+=($modified_exchange)
  elif [[ "$file" =~ $pattern_static_request ]]; then
    modified_exchange="${BASH_REMATCH[1]}"
    REST_EXCHANGES+=($modified_exchange)
  elif [[ "$file" =~ $pattern_static_response ]]; then
    modified_exchange="${BASH_REMATCH[1]}"
    REST_EXCHANGES+=($modified_exchange)
  elif [[ "$file" =~ $ws_pattern ]]; then
    modified_exchange="${BASH_REMATCH[1]}"
    WS_EXCHANGES+=($modified_exchange)
  fi
done

# echo "REST_EXCHANGES: ${REST_EXCHANGES[*]}"
# echo "WS_EXCHANGES: ${WS_EXCHANGES[*]}"

echo "{\"important_modified\": \"$IMPORTANT_MODIFIED\", \"rest_exchanges\": \"${REST_EXCHANGES[*]}\", \"ws_exchanges\": \"${WS_EXCHANGES[*]}\"}"
