using Test
using Ccxt
function testFetchTradingFees(exchange, skippedProperties)

    method = "fetchTradingFees";
    fees = Base.fetch(fetchTradingFees(exchange));
    symbols = objectKeys(fees);
    assertNonEmtpyArray(testSharedMethods, exchange, skippedProperties, method, symbols);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(symbols)))
        symbol = get(symbols, i + 1, nothing);
        testTradingFee(exchange, skippedProperties, method, symbol, get(fees, Symbol(symbol), nothing));
        i += 1
    end
    return true
end
