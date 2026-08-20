using Test
using Ccxt
function testWatchBalance(exchange, skippedProperties, code)

    method = "watchBalance";
    now = milliseconds(exchange);
    ends = now + 15000;
    while functions.ccxtruthy(functions.ccxt_lt(now, ends))
        response = Dict{Symbol, Any}();
        success = true;
        try
            response = Base.fetch(watchBalance(exchange));
        catch e
            if functions.ccxtruthy(!functions.ccxtruthy(isTemporaryFailure(testSharedMethods, e)))
                throw(e);
            end
            now = milliseconds(exchange);
            success = false;

        end
        if functions.ccxtruthy(success == false)
            continue;
        end
        testBalance(exchange, skippedProperties, method, response);
        now = milliseconds(exchange);
    end
end
