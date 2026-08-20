using Test
using Ccxt
function testFetchTickers(exchange, skippedProperties, symbol)

    withoutSymbol = fetchTickersHelperTest(exchange, skippedProperties, nothing);
    withSymbol = fetchTickersHelperTest(exchange, skippedProperties, [symbol]);
    results = Base.fetch(asyncmap(Base.fetch, [withoutSymbol, withSymbol]));
    fetchTickersAmountsTest(exchange, skippedProperties, get(results, 1, nothing));
    return results
end


function fetchTickersHelperTest(exchange, skippedProperties, argSymbols, argParams=Dict())

    method = "fetchTickers";
    response = Base.fetch(fetchTickers(exchange, argSymbols, argParams));
    @test functions.ccxtruthy(isDictionary(exchange, response))
    values_var = objectValues(response);
    checkedSymbol = nothing;
    if functions.ccxtruthy(@functions.ccxt_and(argSymbols != nothing, length(argSymbols) == 1))
        checkedSymbol = get(argSymbols, 1, nothing);
    end
    assertNonEmtpyArray(testSharedMethods, exchange, skippedProperties, method, values_var, checkedSymbol);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(values_var)))
        ticker = get(values_var, i + 1, nothing);
        try
            testTicker(exchange, skippedProperties, method, ticker, checkedSymbol);
        catch e
            Base.fetch(validateTickerExceptionForPercentage(testSharedMethods, ex, exchange, ticker));

        end
        i += 1
    end
    return response
end


function fetchTickersAmountsTest(exchange, skippedProperties, tickers)

    tickersValues = objectValues(tickers);
    if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in("checkActiveSymbols", skippedProperties))))
        nonInactiveMarkets = getActiveMarkets(testSharedMethods, exchange);
        notInactiveSymbolsLength = length(nonInactiveMarkets);
        obtainedTickersLength = length(tickersValues);
        minRatio = 0.99;
        @test functions.ccxtruthy(functions.ccxt_ge(obtainedTickersLength, notInactiveSymbolsLength * minRatio))
        allMarkets = get(exchange, Symbol("markets"), nothing);
        allMarketsLength = length(objectKeys(allMarkets));
        @test functions.ccxtruthy(functions.ccxt_le(obtainedTickersLength, allMarketsLength))
    end
end
