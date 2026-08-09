using Test
using Ccxt
function testFetchLastPrices(exchange, skippedProperties, symbol)

    method = "fetchLastprices";
    response = Dict{Symbol, Any}();
    checkedSymbol = nothing;
    try
        response = Base.fetch(fetchLastPrices(exchange));
    catch e
        response = Base.fetch(fetchLastPrices(exchange, [symbol]));
        checkedSymbol = symbol;

    end
    @test functions.ccxtruthy(isDictionary(exchange, response))
    values_var = objectValues(response);
    assertNonEmtpyArray(testSharedMethods, exchange, skippedProperties, method, values_var, checkedSymbol);
    atLeastOnePassed = false;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(values_var)))
        testLastPrice(exchange, skippedProperties, method, get(values_var, i + 1, nothing), checkedSymbol);
        atLeastOnePassed = @functions.ccxt_or(atLeastOnePassed,         (functions.ccxt_gt(safeNumber(exchange, get(values_var, i + 1, nothing), "price"), 0)));
        i += 1
    end
    @test functions.ccxtruthy(atLeastOnePassed)
    return true
end
