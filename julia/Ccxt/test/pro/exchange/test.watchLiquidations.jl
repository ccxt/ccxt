using Test
using Ccxt
function testWatchLiquidations(exchange, skippedProperties, symbol)

    method = "watchLiquidations";
    skippedExchanges = [];
    if functions.ccxtruthy(inArray(exchange, get(exchange, Symbol("id"), nothing), skippedExchanges))
        m1 = (string(get(exchange, Symbol("id"), nothing), " ", method, "() test skipped"));
        println(m1);
            return false
    end
    if functions.ccxtruthy(!functions.ccxtruthy(get(get(exchange, Symbol("has"), nothing), Symbol(method), nothing)))
        m2 = (string(get(exchange, Symbol("id"), nothing), " does not support ", method, "() method"));
        println(m2);
            return false
    end
    response = [];
    now = round(Int, time() * 1000);
    ends = now + 10000;
    while functions.ccxtruthy(functions.ccxt_lt(now, ends))
        try
            response = Base.fetch(getproperty(exchange, Symbol(method))(symbol));
            now = round(Int, time() * 1000);
            isArray = functions.ccxt_isArray(response);
            @test functions.ccxtruthy(isArray)
            m3 = (string(get(exchange, Symbol("id"), nothing), " ", method, "() returned ", length(response), " liquidations"));
            println(m3);
            i = 0
            while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
                testLiquidation(exchange, skippedProperties, method, get(response, i + 1, nothing), symbol);
                i += 1
            end
        catch e
            if functions.ccxtruthy(!functions.ccxtruthy((isa(e, NetworkError))))
                throw(e);
            end
            now = round(Int, time() * 1000);

        end
    end
    return response
end
