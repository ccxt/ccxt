using Test
using Ccxt
function testFetchMarginModes(exchange, skippedProperties, symbol)

    method = "fetchMarginModes";
    marginModes = Base.fetch(fetchMarginModes(exchange, ["symbol"]));
    @test functions.ccxtruthy(isDictionary(exchange, marginModes))
    marginModeKeys = objectKeys(marginModes);
    assertNonEmtpyArray(testSharedMethods, exchange, skippedProperties, method, marginModes, symbol);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(marginModeKeys)))
        marginMode = get(marginModes, Symbol(get(marginModeKeys, i + 1, nothing)), nothing);
        assertNonEmtpyArray(testSharedMethods, exchange, skippedProperties, method, marginMode, symbol);
        testMarginMode(exchange, skippedProperties, method, marginMode);
        i += 1
    end
    return true
end
