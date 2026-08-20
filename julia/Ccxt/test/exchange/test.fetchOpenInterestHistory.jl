using Test
using Ccxt
function testFetchOpenInterestHistory(exchange, skippedProperties, symbol)

    method = "fetchOpenInterestHistory";
    openInterestHistory = Base.fetch(fetchOpenInterestHistory(exchange, symbol));
    assertNonEmtpyArray(testSharedMethods, exchange, skippedProperties, method, openInterestHistory, symbol);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(openInterestHistory)))
        testOpenInterest(exchange, skippedProperties, method, get(openInterestHistory, i + 1, nothing));
        i += 1
    end
    return true
end
