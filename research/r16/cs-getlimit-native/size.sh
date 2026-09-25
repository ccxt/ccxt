#!/bin/sh
# usage: size.sh <rev>  -- callDynamically counts in generated C#
r=${1:-HEAD}
echo "pro total: $(git grep -h -o 'callDynamically(' $r -- cs/ccxt/exchanges/pro | wc -l)"
echo "pro getLimit/append: $(git grep -h -o 'callDynamically([^,]*, "\(getLimit\|append\)"' $r -- cs/ccxt/exchanges/pro | wc -l)"
echo "non-pro total: $(git grep -h -o 'callDynamically(' $r -- cs ':!cs/ccxt/exchanges/pro' ':!cs/ccxt/base' | wc -l)"
