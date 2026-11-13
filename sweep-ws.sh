#!/bin/bash
# Per-venue ws static sweep with timeouts: the aggregate run's per-frame
# rejection backstops (up to 30s each) make a single all-exchange invocation
# take >30min; bounding each venue keeps the total sane while staying faithful
# to the harness.
cd /root/new-lang/ccxt || exit 1
EXES="binance bingx bitget bitvavo bybit coinbase cryptocom deribit gate htx hyperliquid kraken kucoin kucoinfutures okx paradex phemex poloniex toobit upbit whitebit"
PASS=0; FAIL=0; FAILED_NAMES=""
for ex in $EXES; do
    out=$(timeout 120 ./cpp/build/ccxt-tests "$ex" --wsTests 2>&1)
    rc=$?
    if echo "$out" | grep -q 'TEST_FAILURE'; then
        echo "FAIL $ex"
        FAIL=$((FAIL+1)); FAILED_NAMES="$FAILED_NAMES $ex"
        echo "$out" | grep 'TEST_FAILURE' | head -6
    elif [ $rc -ne 0 ] && ! echo "$out" | grep -q 'TEST_SUCCESS'; then
        echo "TIMEOUT/CRASH $ex (rc=$rc)"
        FAIL=$((FAIL+1)); FAILED_NAMES="$FAILED_NAMES $ex"
    else
        echo "PASS $ex"
        PASS=$((PASS+1))
    fi
done
echo "==== SWEEP: $PASS pass, $FAIL fail ===="
if [ -n "$FAILED_NAMES" ]; then
    echo "failed:$FAILED_NAMES"
    exit 1
fi
exit 0
