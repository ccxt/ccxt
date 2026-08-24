using Test
using Ccxt
function testFetchMyTrades(exchange, skippedProperties, symbol)

    method = "fetchMyTrades";
    trades = Base.fetch(fetchMyTrades(exchange, symbol));
    assertNonEmtpyArray(testSharedMethods, exchange, skippedProperties, method, trades, symbol);
    now = milliseconds(exchange);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(trades)))
        testTrade(exchange, skippedProperties, method, get(trades, i + 1, nothing), symbol, now);
        i += 1
    end
    assertTimestampOrder(testSharedMethods, exchange, method, symbol, trades);
    return true
end
