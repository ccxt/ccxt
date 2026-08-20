using Test
using Ccxt
function testFetchOHLCV(exchange, skippedProperties, symbol)

    method = "fetchOHLCV";
    timeframeKeys = objectKeys(get(exchange, Symbol("timeframes"), nothing));
    @test functions.ccxtruthy(length(timeframeKeys))
    chosenTimeframeKey = "1m";
    if functions.ccxtruthy(!functions.ccxtruthy(inArray(exchange, chosenTimeframeKey, timeframeKeys)))
        chosenTimeframeKey = get(timeframeKeys, 1, nothing);
    end
    limit = 10;
    duration = parseTimeframe(exchange, chosenTimeframeKey);
    since = milliseconds(exchange) - duration * limit * 1000 - 1000;
    ohlcvs = Base.fetch(fetchOHLCV(exchange, symbol, chosenTimeframeKey, since, limit));
    assertNonEmtpyArray(testSharedMethods, exchange, skippedProperties, method, ohlcvs, symbol);
    now = milliseconds(exchange);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(ohlcvs)))
        testOHLCV(exchange, skippedProperties, method, get(ohlcvs, i + 1, nothing), symbol, now);
        i += 1
    end
    return true
end
