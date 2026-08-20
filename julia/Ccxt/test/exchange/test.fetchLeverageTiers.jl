using Test
using Ccxt
function testFetchLeverageTiers(exchange, skippedProperties, symbol)

    method = "fetchLeverageTiers";
    tiers = Base.fetch(fetchLeverageTiers(exchange, ["symbol"]));
    @test functions.ccxtruthy(isDictionary(exchange, tiers))
    tierKeys = objectKeys(tiers);
    assertNonEmtpyArray(testSharedMethods, exchange, skippedProperties, method, tierKeys, symbol);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(tierKeys)))
        tiersForSymbol = get(tiers, Symbol(get(tierKeys, i + 1, nothing)), nothing);
        assertNonEmtpyArray(testSharedMethods, exchange, skippedProperties, method, tiersForSymbol, symbol);
        j = 0
        while functions.ccxtruthy(functions.ccxt_lt(j, length(tiersForSymbol)))
            testLeverageTier(exchange, skippedProperties, method, get(tiersForSymbol, j + 1, nothing));
            j += 1
        end
        i += 1
    end
    return true
end
