using Test
using Ccxt
function testWatchTicker(exchange, skippedProperties, symbol)

    method = "watchTicker";
    now = milliseconds(exchange);
    ends = now + 15000;
    while functions.ccxtruthy(functions.ccxt_lt(now, ends))
        response = nothing;
        success = true;
        try
            response = Base.fetch(watchTicker(exchange, symbol));
        catch e
            if functions.ccxtruthy(!functions.ccxtruthy(isTemporaryFailure(testSharedMethods, e)))
                throw(e);
            end
            now = milliseconds(exchange);
            success = false;

        end
        if functions.ccxtruthy(success)
            @test functions.ccxtruthy(isDictionary(exchange, response))
            now = milliseconds(exchange);
            testTicker(exchange, skippedProperties, method, response, symbol);
        end
    end
    return true
end
