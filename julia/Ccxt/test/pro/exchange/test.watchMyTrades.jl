using Test
using Ccxt
function testWatchMyTrades(exchange, skippedProperties, symbol)

    method = "watchMyTrades";
    now = milliseconds(exchange);
    ends = now + 15000;
    while functions.ccxtruthy(functions.ccxt_lt(now, ends))
        success = true;
        response = [];
        try
            response = Base.fetch(watchMyTrades(exchange, symbol));
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
                testTrade(exchange, skippedProperties, method, get(response, i + 1, nothing), symbol, now);
                i += 1
            end

            assertTimestampOrder(testSharedMethods, exchange, method, symbol, response);
        end
    end
    return true
end
