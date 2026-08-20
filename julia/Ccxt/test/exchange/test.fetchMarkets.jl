using Test
using Ccxt
function testFetchMarkets(exchange, skippedProperties)

    method = "fetchMarkets";
    markets = Base.fetch(fetchMarkets(exchange));
    @test functions.ccxtruthy(isDictionary(exchange, markets))
    marketValues = objectValues(markets);
    assertNonEmtpyArray(testSharedMethods, exchange, skippedProperties, method, marketValues);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(marketValues)))
        testMarket(exchange, skippedProperties, method, get(marketValues, i + 1, nothing));
        i += 1
    end
    detectMarketConflicts(exchange, markets);
    return true
end


function detectMarketConflicts(exchange, marketValues)

    ids = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(marketValues)))
        market = get(marketValues, i + 1, nothing);
        symbol = get(market, Symbol("symbol"), nothing);
        if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in(symbol, ids))))
            ids[Symbol(symbol)] = get(market, Symbol("id"), nothing);
        else
            isDifferent = get(ids, Symbol(symbol), nothing) != get(market, Symbol("id"), nothing);
            @test !functions.ccxtruthy(isDifferent)
        end
        i += 1
    end
    return true
end
