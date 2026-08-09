using Test
using Ccxt
function testFetchMyLiquidations(exchange, skippedProperties, code)

    method = "fetchMyLiquidations";
    if functions.ccxtruthy(!functions.ccxtruthy(get(get(exchange, Symbol("has"), nothing), Symbol("fetchMyLiquidations"), nothing)))
            return true
    end
    items = Base.fetch(fetchMyLiquidations(exchange, code));
    @test functions.ccxtruthy(functions.ccxt_isArray(items))
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(items)))
        testLiquidation(exchange, skippedProperties, method, get(items, i + 1, nothing), code);
        i += 1
    end
    assertTimestampOrder(testSharedMethods, exchange, method, code, items);
    return true
end
