using Test
using Ccxt
function testWatchBidsAsks(exchange, skippedProperties, symbol)

    withoutSymbol = testWatchBidsAsksHelper(exchange, skippedProperties, nothing);
    withSymbol = testWatchBidsAsksHelper(exchange, skippedProperties, [symbol]);
    Base.fetch(asyncmap(Base.fetch, [withSymbol, withoutSymbol]));
end


function testWatchBidsAsksHelper(exchange, skippedProperties, argSymbols, argParams=Dict())

    method = "watchBidsAsks";
    now = milliseconds(exchange);
    ends = now + 15000;
    while functions.ccxtruthy(functions.ccxt_lt(now, ends))
        success = true;
        shouldReturn = false;
        response = Dict{Symbol, Any}();
        try
            response = Base.fetch(watchBidsAsks(exchange, argSymbols, argParams));
        catch e
            if functions.ccxtruthy(@functions.ccxt_and((isa(e, ArgumentsRequired)), (@functions.ccxt_or(argSymbols == nothing, length(argSymbols) == 0))))
                shouldReturn = true;
            elseif functions.ccxtruthy(!functions.ccxtruthy(isTemporaryFailure(testSharedMethods, e)))
                throw(e);
            end
            now = milliseconds(exchange);
            success = false;

        end
        if functions.ccxtruthy(shouldReturn)
                return false
        end
        if functions.ccxtruthy(success)
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
                testTicker(exchange, skippedProperties, method, ticker, checkedSymbol);
                i += 1
            end

            now = milliseconds(exchange);
        end
    end
    return true
end
