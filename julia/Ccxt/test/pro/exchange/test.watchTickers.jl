using Test
using Ccxt
function testWatchTickers(exchange, skippedProperties, symbol)

    withoutSymbol = testWatchTickersHelper(exchange, skippedProperties, nothing);
    withSymbol = testWatchTickersHelper(exchange, skippedProperties, [symbol]);
    Base.fetch(asyncmap(Base.fetch, [withSymbol, withoutSymbol]));
end


function testWatchTickersHelper(exchange, skippedProperties, argSymbols, argParams=Dict())

    method = "watchTickers";
    now = milliseconds(exchange);
    ends = now + 15000;
    while functions.ccxtruthy(functions.ccxt_lt(now, ends))
        response = Dict{Symbol, Any}();
        success = true;
        shouldReturn = false;
        try
            response = Base.fetch(watchTickers(exchange, argSymbols, argParams));
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
                try
                    testTicker(exchange, skippedProperties, method, ticker, checkedSymbol);
                catch e
                    Base.fetch(validateTickerExceptionForPercentage(testSharedMethods, ex, exchange, ticker));

                end
                i += 1
            end

            now = milliseconds(exchange);
        end
    end
    return true
end
