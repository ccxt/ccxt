using Test
using Ccxt
function testWatchOrders(exchange, skippedProperties, symbol)

    method = "watchOrders";
    now = milliseconds(exchange);
    ends = now + 15000;
    while functions.ccxtruthy(functions.ccxt_lt(now, ends))
        response = nothing;
        success = true;
        try
            response = Base.fetch(watchOrders(exchange, symbol));
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
                testOrder(exchange, skippedProperties, method, get(response, i + 1, nothing), symbol, now);
                i += 1
            end

            assertTimestampOrder(testSharedMethods, exchange, method, symbol, response);
        end
    end
    return true
end
