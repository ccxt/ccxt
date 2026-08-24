using Test
using Ccxt
function testLoadMarkets(exchange, skippedProperties)

    method = "loadMarkets";
    markets = Base.fetch(loadMarkets(exchange));
    @test functions.ccxtruthy(isDictionary(exchange, get(exchange, Symbol("markets"), nothing)))
    @test functions.ccxtruthy(functions.ccxt_isArray(get(exchange, Symbol("symbols"), nothing)))
    symbolsLength = length(get(exchange, Symbol("symbols"), nothing));
    marketKeys = objectKeys(get(exchange, Symbol("markets"), nothing));
    marketKeysLength = length(marketKeys);
    @test functions.ccxtruthy(functions.ccxt_gt(symbolsLength, 0));
    @test functions.ccxtruthy(functions.ccxt_gt(marketKeysLength, 0));
    @test symbolsLength == marketKeysLength
    marketValues = objectValues(markets);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(marketValues)))
        testMarket(exchange, skippedProperties, method, get(marketValues, i + 1, nothing));
        i += 1
    end
    return true
end
