#!/bin/bash

diff=$(git diff --name-only HEAD^1 HEAD)
diff=$(echo "$diff" | sed -e "s/^build\.sh//")
diff=$(echo "$diff" | sed -e "s/^skip\-tests\.json//")
diff=$(echo "$diff" | sed -e "s/^run\-tests\-simul\.sh//")
diff=$(echo "$diff" | sed -e "s/^\w+.yml//") # tmp remove actions files
diff_without_statics=$(echo "$diff" | sed -e "s/^ts\/src\/test\/static.*json//")

# ts/ccxt.ts sits in the critical set because structural changes to the entry file affect every
# runtime. But when a PR integrates a new exchange for the first time, ts/ccxt.ts changes in
# exactly one way: it gains the two integration lines for the newcomer — an import and a map
# entry. An integration-only diff cannot affect any already-integrated exchange (the build job
# compiles the file regardless), yet the ccxt.ts critical arm was forcing a FULL live-test run
# over all ~111 exchanges for every first-time integration. An integration-only content diff is
# therefore stripped from the critical check so live tests stay scoped to the exchange(s)
# actually touched; any other changed line in ccxt.ts keeps the file critical and the full run
# intact.
if echo "$diff" | grep -qx 'ts/ccxt.ts'; then
    ccxt_ts_content_diff=$(git diff -U0 HEAD^1 HEAD -- ts/ccxt.ts | grep -E '^[+-]' | grep -vE '^(\+\+\+|---)')
    # a complete wire-up touches up to four line shapes per exchange id:
    #   import <id> from './src/<id>.js'           (rest import)
    #   import <id>Pro from './src/pro/<id>.js'    (pro import)
    #   '<id>': <id>,  /  '<id>': <id>Pro,         (rest / pro map entries)
    #   <id>,                                      (bare export-list line)
    # the bare export-list shape is shared with structural exports (version, errors, functions, ...),
    # so a bare line only counts as integration glue when its identifier is wired by an import or
    # map line WITHIN THE SAME DIFF — a lone export-list change stays critical (fail-closed)
    integration_import="^[+-]import ([A-Za-z0-9_]+) from +'\./src/[A-Za-z0-9_]+\.js'\$"
    integration_pro_import="^[+-]import ([A-Za-z0-9_]+)Pro from +'\./src/pro/[A-Za-z0-9_]+\.js'\$"
    integration_map="^[+-][[:space:]]+'([A-Za-z0-9_-]+)':[[:space:]]+[A-Za-z0-9_]+,\$"
    integration_export="^[+-][[:space:]]+([A-Za-z0-9_]+),\$"
    if [[ -n "$ccxt_ts_content_diff" ]]; then
        # the gate set is harvested from IMPORT lines only: map entries and export-list lines both
        # count solely for ids that gain or lose an import in the same diff. Gating maps on the
        # map lines themselves would let a map-only rewire of an EXISTING exchange (e.g. flipping
        # 'binance': ... with no import change) sail through as integration-only — and a blanket
        # "at least one import anywhere" gate would let such a rewire smuggle in alongside an
        # unrelated genuine integration, so the check is per-id
        import_ids=" $(echo "$ccxt_ts_content_diff" | sed -nE "s/^[+-]import ([A-Za-z0-9_]+)Pro from +'\.\/src\/pro\/[A-Za-z0-9_]+\.js'\$/\1/p; s/^[+-]import ([A-Za-z0-9_]+) from +'\.\/src\/[A-Za-z0-9_]+\.js'\$/\1/p" | sort -u | tr '\n' ' ') "
        integration_only="true"
        while IFS= read -r line; do
            if [[ "$line" =~ $integration_pro_import || "$line" =~ $integration_import ]]; then
                continue
            elif [[ "$line" =~ $integration_map ]]; then
                map_id="${BASH_REMATCH[1]}"
                if [[ "$import_ids" != *" ${map_id} "* ]]; then
                    integration_only="false"
                    break
                fi
            elif [[ "$line" =~ $integration_export ]]; then
                bare_id="${BASH_REMATCH[1]}"
                if [[ "$import_ids" != *" ${bare_id} "* ]]; then
                    integration_only="false"
                    break
                fi
            else
                integration_only="false"
                break
            fi
        done <<< "$ccxt_ts_content_diff"
        if [[ "$integration_only" == "true" ]]; then
            diff_without_statics=$(echo "$diff_without_statics" | sed -e "s/^ts\/ccxt\.ts$//")
        fi
    fi
fi

# critical_pattern assembled one language per line, joined below
critical_php='Client(Trait)?\.php|Exchange\.php|composer\.json'
critical_python='__init__.py'
critical_go='go\/v4\/exchange_' # hand-written go base files, see https://github.com/ccxt/ccxt/pull/29740
critical_cs_java_ws='ccxt\/ws\/' # covers hand-written cs/ccxt/ws/ and java .../io/github/ccxt/ws/ base files, see https://github.com/ccxt/ccxt/pull/29747
critical_java='io\/github\/ccxt\/(BaseExchange|Client|Exchange|Helpers|IOrderBookSide|PredictionExchange|Throttler)\.java|io\/github\/ccxt\/types\/|build\.gradle' # file list because a blanket io/github/ccxt/*.java would fire on auto-bumped Version.java (build/vss.js) and generated MetaData.java (build/export-exchanges.ts); types/ is listed because java base types escape the \/base and go\/v4\/exchange_ arms their cs/go siblings match; build\.gradle (also matches .gradle.kts) because ^build is anchored and the gradle wiring otherwise escapes
critical_shared='\/base|^build|static_dependencies|^run-tests|ccxt\.ts|test' # add \/test| # remove package json temporarily todo revert this!!
critical_pattern="$critical_php|$critical_python|$critical_go|$critical_cs_java_ws|$critical_java|$critical_shared"
# critical_pattern='Client(Trait)?\.php|Exchange\.php|\/base|^build|static_dependencies|^run-tests|package(-lock)?\.json|composer\.json|ccxt\.ts|__init__.py|test' # add \/test|

COMMIT_MESSAGE=$(git log -1 --pretty=%B)

if [[ "$GITHUB_REF" == "refs/heads/master" ]]; then
    IMPORTANT_MODIFIED="true"
    # echo "$msgPrefix Running on master branch - doing full build & test"
elif [[ "$COMMIT_MESSAGE" == *"TRIGGER_BUILD"* ]]; then
    IMPORTANT_MODIFIED="true"
elif [[ "$diff_without_statics" =~ $critical_pattern ]]; then
    IMPORTANT_MODIFIED="true"
    # echo "$msgPrefix Critial changes detected - doing full build & test"
else
    # echo "$msgPrefix Unimportant changes detected - build & test only specific exchange(s)"
    IMPORTANT_MODIFIED="false"
fi

# prediction-market sources/fixtures live outside the regular ts/src/*.ts + ts/src/pro/*.ts globs,
# so flag them separately to drive the per-language prediction transpile + test CI steps
if [[ "$IMPORTANT_MODIFIED" == "true" ]] || echo "$diff" | grep -qE 'ts/src/prediction/|ts/src/pro/prediction/|ts/src/test/static/(request|response)/prediction/'; then
    PREDICTION_MODIFIED="true"
else
    PREDICTION_MODIFIED="false"
fi

# echo "$diff_without_statics"

if [ "$IMPORTANT_MODIFIED" == "true" ]; then
  echo "{\"important_modified\": \"$IMPORTANT_MODIFIED\", \"prediction_modified\": \"$PREDICTION_MODIFIED\", \"rest_exchanges\": [], \"ws_exchanges\": []}"
  exit
fi

readarray -t y <<<"$diff"
rest_pattern='ts\/src\/([A-Za-z0-9_-]+).ts' # \w not working for some reason
ws_pattern='ts\/src\/pro\/([A-Za-z0-9_-]+)\.ts'
# prediction-market exchanges live under ts/src/prediction/ (rest) and ts/src/pro/prediction/
# (ws) — the rest/ws patterns above can't match them because the extra path segment blocks it
prediction_pattern='ts\/src\/prediction\/([A-Za-z0-9_-]+)\.ts'
prediction_ws_pattern='ts\/src\/pro\/prediction\/([A-Za-z0-9_-]+)\.ts'
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
  if [[ "$file" =~ $prediction_ws_pattern ]]; then
    modified_exchange="${BASH_REMATCH[1]}"
    if [[ ! " ${WS_EXCHANGES[@]} " =~ " ${modified_exchange} " ]]; then
      WS_EXCHANGES+=("$modified_exchange")
    fi
  elif [[ "$file" =~ $prediction_pattern ]]; then
    modified_exchange="${BASH_REMATCH[1]}"
    if [[ ! " ${REST_EXCHANGES[@]} " =~ " ${modified_exchange} " ]]; then
      REST_EXCHANGES+=("$modified_exchange")
    fi
  elif [[ "$file" =~ $rest_pattern ]]; then
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

echo "{\"important_modified\": \"$IMPORTANT_MODIFIED\", \"prediction_modified\": \"$PREDICTION_MODIFIED\", \"rest_exchanges\": $rest_exchanges_json, \"ws_exchanges\": $ws_exchanges_json}"