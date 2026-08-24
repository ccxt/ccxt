using Test
using Ccxt
function testFetchMarketLeverageTiers(exchange, skippedProperties, symbol)

    method = "fetchMarketLeverageTiers";
    tiers = Base.fetch(fetchMarketLeverageTiers(exchange, symbol));
    assertNonEmtpyArray(testSharedMethods, exchange, skippedProperties, method, tiers, symbol);
    j = 0
    while functions.ccxtruthy(functions.ccxt_lt(j, length(tiers)))
        testLeverageTier(exchange, skippedProperties, method, get(tiers, j + 1, nothing));
        j += 1
    end
    return true
end
