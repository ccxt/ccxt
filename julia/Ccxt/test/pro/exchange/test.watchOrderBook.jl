using Test
using Ccxt
function testWatchOrderBook(exchange, skippedProperties, symbol)

    method = "watchOrderBook";
    now = milliseconds(exchange);
    ends = now + 15000;
    while functions.ccxtruthy(functions.ccxt_lt(now, ends))
        response = nothing;
        success = true;
        try
            response = Base.fetch(watchOrderBook(exchange, symbol));
        catch e
            if functions.ccxtruthy(!functions.ccxtruthy(isTemporaryFailure(testSharedMethods, e)))
                throw(e);
            end
            now = milliseconds(exchange);
            success = false;

        end
        if functions.ccxtruthy(@functions.ccxt_and((success), (response != nothing)))
            @test functions.ccxtruthy(isDictionary(exchange, response))
            now = milliseconds(exchange);
            testOrderBook(exchange, skippedProperties, method, response, symbol);
        end
    end
    return true
end
