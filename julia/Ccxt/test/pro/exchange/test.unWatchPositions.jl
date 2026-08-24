using Test
using Ccxt
function createOrderAfterDelay(exchange)

    Base.fetch(sleep(exchange, 3000));
    Base.fetch(createOrder(exchange, "BTC/USDT:USDT", "market", "buy", 0.001));
end


function testUnWatchPositions(exchange, skippedProperties, symbol)

    method = "unWatchPositions";
    setSandboxMode(exchange, true);
    positionsSubscription = nothing;
    try
        positionsSubscription = Base.fetch(watchPositions(exchange));
        spawn(exchange, createOrderAfterDelay, exchange);
        positionsSubscription = Base.fetch(watchPositions(exchange));
    catch e
        if functions.ccxtruthy(!functions.ccxtruthy(isTemporaryFailure(testSharedMethods, e)))
            throw(e);
        end
        return false

    end
    @test functions.ccxtruthy(functions.ccxt_isArray(positionsSubscription))
    errorResponse = nothing;
    try
        errorResponse = Base.fetch(unWatchPositions(exchange, [symbol]));
    catch e
        errorResponse = e;

    end
    @test errorResponse != nothing
    responseAll = nothing;
    try
        responseAll = Base.fetch(unWatchPositions(exchange));
    catch e
        if functions.ccxtruthy(!functions.ccxtruthy(isTemporaryFailure(testSharedMethods, e)))
            throw(e);
        end
        throw(e);

    end
    @test responseAll != nothing
    resubscribeResponse = nothing;
    try
        resubscribeResponse = Base.fetch(watchPositions(exchange));
        spawn(exchange, createOrderAfterDelay, exchange);
        resubscribeResponse = Base.fetch(watchPositions(exchange));
    catch e
        if functions.ccxtruthy(!functions.ccxtruthy(isTemporaryFailure(testSharedMethods, e)))
            throw(e);
        end
        throw(Error(string(get(exchange, Symbol("id"), nothing), " ", method, " failed to resubscribe after unwatch, indicating potential cleanup issues")));

    end
    @test functions.ccxtruthy(functions.ccxt_isArray(resubscribeResponse))
    return true
end
