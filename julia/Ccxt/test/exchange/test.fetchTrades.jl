using Test
using Ccxt
function testFetchTrades(exchange, skippedProperties, symbol)

    method = "fetchTrades";
    trades = Base.fetch(fetchTrades(exchange, symbol));
    assertNonEmtpyArray(testSharedMethods, exchange, skippedProperties, method, trades);
    now = milliseconds(exchange);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(trades)))
        testTrade(exchange, skippedProperties, method, get(trades, i + 1, nothing), symbol, now);
        assertInArray(testSharedMethods, exchange, skippedProperties, method, get(trades, i + 1, nothing), "takerOrMaker", ["taker", nothing]);
        i += 1
    end
    if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in("timestampSort", skippedProperties))))
        assertTimestampOrder(testSharedMethods, exchange, method, symbol, trades);
    end
    return true
end
