using Test
using Ccxt
function testWatchTradesForSymbols(exchange, skippedProperties, symbols)

    method = "watchTradesForSymbols";
    now = milliseconds(exchange);
    ends = now + 15000;
    returnedSymbols = [];
    while functions.ccxtruthy(@functions.ccxt_or(functions.ccxt_lt(now, ends), functions.ccxt_lt(length(returnedSymbols), length(symbols))))
        response = nothing;
        success = true;
        try
            response = Base.fetch(watchTradesForSymbols(exchange, symbols));
        catch e
            if functions.ccxtruthy(!functions.ccxtruthy(isTemporaryFailure(testSharedMethods, e)))
                throw(e);
            end
            now = milliseconds(exchange);

        end
        if functions.ccxtruthy(@functions.ccxt_and((success), (response != nothing)))
            @test functions.ccxtruthy(functions.ccxt_isArray(response))
            now = milliseconds(exchange);
            symbol = nothing;
            i = 0
            while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
                trade = get(response, i + 1, nothing);
                symbol = get(trade, Symbol("symbol"), nothing);
                if functions.ccxtruthy(symbol == nothing)
                    i += 1; continue
                end
                testTrade(exchange, skippedProperties, method, trade, symbol, now);
                assertInArray(testSharedMethods, exchange, skippedProperties, method, trade, "symbol", symbols);
                if functions.ccxtruthy(!functions.ccxtruthy(inArray(exchange, symbol, returnedSymbols)))
                                        push!(returnedSymbols, symbol);
                end
                i += 1
            end

        end
    end
    return true
end
