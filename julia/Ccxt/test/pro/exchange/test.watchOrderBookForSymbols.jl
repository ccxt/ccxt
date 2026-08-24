using Test
using Ccxt
function testWatchOrderBookForSymbols(exchange, skippedProperties, symbols)

    method = "watchOrderBookForSymbols";
    currentTime = milliseconds(exchange);
    deadline = currentTime + 15000;
    seenSymbols = [];
    while functions.ccxtruthy(@functions.ccxt_or(functions.ccxt_lt(currentTime, deadline), functions.ccxt_lt(length(seenSymbols), length(symbols))))
        response = nothing;
        succeeded = true;
        try
            response = Base.fetch(watchOrderBookForSymbols(exchange, symbols));
        catch e
            if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(isTemporaryFailure(testSharedMethods, e)), !functions.ccxtruthy((isa(e, InvalidNonce)))))
                throw(e);
            end
            currentTime = milliseconds(exchange);
            succeeded = false;

        end
        if functions.ccxtruthy(@functions.ccxt_and((succeeded), (response != nothing)))
            @test functions.ccxtruthy(isDictionary(exchange, response))
            currentTime = milliseconds(exchange);
            assertInArray(testSharedMethods, exchange, skippedProperties, method, response, "symbol", symbols);
            testOrderBook(exchange, skippedProperties, method, response, nothing);
            symbol = get(response, Symbol("symbol"), nothing);
            if functions.ccxtruthy(@functions.ccxt_and((symbol != nothing), !functions.ccxtruthy(inArray(exchange, symbol, seenSymbols))))
                                push!(seenSymbols, symbol);
            end
        end
    end
    return true
end
