using Test
using Ccxt
function testWatchOHLCV(exchange, skippedProperties, symbol)

    method = "watchOHLCV";
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
            response = Base.fetch(watchOHLCV(exchange, symbol, chosenTimeframeKey, since, limit));
        catch e
            if functions.ccxtruthy(!functions.ccxtruthy(isTemporaryFailure(testSharedMethods, e)))
                throw(e);
            end
            now = milliseconds(exchange);
            success = false;

        end
        if functions.ccxtruthy(success)
            assertNonEmtpyArray(testSharedMethods, exchange, skippedProperties, method, response, symbol);
            now = milliseconds(exchange);
            i = 0
            while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
                testOHLCV(exchange, skippedProperties, method, get(response, i + 1, nothing), symbol, now);
                i += 1
            end

        end
    end
    return true
end
