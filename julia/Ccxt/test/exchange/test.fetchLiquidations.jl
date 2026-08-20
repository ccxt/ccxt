using Test
using Ccxt
function testFetchLiquidations(exchange, skippedProperties, code)

    method = "fetchLiquidations";
    if functions.ccxtruthy(!functions.ccxtruthy(get(get(exchange, Symbol("has"), nothing), Symbol("fetchLiquidations"), nothing)))
            return true
    end
    items = Base.fetch(fetchLiquidations(exchange, code));
    @test functions.ccxtruthy(functions.ccxt_isArray(items))
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(items)))
        testLiquidation(exchange, skippedProperties, method, get(items, i + 1, nothing), code);
        i += 1
    end
    assertTimestampOrder(testSharedMethods, exchange, method, code, items);
    return true
end
