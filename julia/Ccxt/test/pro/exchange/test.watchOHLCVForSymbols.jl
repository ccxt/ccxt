using Test
using Ccxt
function testWatchOHLCVForSymbols(exchange, skippedProperties, symbol)

    method = "watchOHLCVForSymbols";
    now = milliseconds(exchange);
    ends = now + 15000;
    timeframeKeys = objectKeys(get(exchange, Symbol("timeframes"), nothing));
    @test functions.ccxtruthy(length(timeframeKeys))
    chosenTimeframeKey = "1m";
    if functions.ccxtruthy(!functions.ccxtruthy(inArray(exchange, chosenTimeframeKey, timeframeKeys)))
        chosenTimeframeKey = get(timeframeKeys, 1, nothing);
    end
    limit = 10;
    duration = parseTimeframe(exchange, chosenTimeframeKey);
    since = milliseconds(exchange) - duration * limit * 1000 - 1000;
    while functions.ccxtruthy(functions.ccxt_lt(now, ends))
        response = nothing;
        success = true;
        try
            response = Base.fetch(watchOHLCVForSymbols(exchange, [[symbol, chosenTimeframeKey]], since, limit));
        catch e
            if functions.ccxtruthy(!functions.ccxtruthy(isTemporaryFailure(testSharedMethods, e)))
                throw(e);
            end
            now = milliseconds(exchange);
            success = false;

        end
        if functions.ccxtruthy(success)
            assertionMessage = string(get(exchange, Symbol("id"), nothing), " ", method, " ", symbol, " ", chosenTimeframeKey, " | ", json(exchange, response));
            @test functions.ccxtruthy(isDictionary(exchange, response))
            @test functions.ccxtruthy(ccxt_in(symbol, response))
            symbolObj = get(response, Symbol(symbol), nothing);
            @test functions.ccxtruthy(isDictionary(exchange, symbolObj))
            @test functions.ccxtruthy(ccxt_in(chosenTimeframeKey, symbolObj))
            ohlcvs = get(symbolObj, Symbol(chosenTimeframeKey), nothing);
            @test functions.ccxtruthy(functions.ccxt_isArray(ohlcvs))
            now = milliseconds(exchange);
            i = 0
            while functions.ccxtruthy(functions.ccxt_lt(i, length(ohlcvs)))
                testOHLCV(exchange, skippedProperties, method, get(ohlcvs, i + 1, nothing), symbol, now);
                i += 1
            end

        end
    end
    return true
end
