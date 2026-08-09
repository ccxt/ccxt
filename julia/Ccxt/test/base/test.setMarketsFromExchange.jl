using Test
using Ccxt
function testSetMarketsFromExchange()

    emptyExchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sample0"
    ));
    methodName = "setMarketsFromExchange";
    trueClause = safeString(emptyExchange, nothing, nothing) == nothing;
    sampleMarket = Dict{Symbol, Any}(
        Symbol("BTC/USD") => Dict{Symbol, Any}(
            Symbol("id") => "BtcUsd",
            Symbol("symbol") => "BTC/USD",
            Symbol("base") => "BTC",
            Symbol("quote") => "USD",
            Symbol("baseId") => "Btc",
            Symbol("quoteId") => "Usd",
            Symbol("type") => "spot",
            Symbol("spot") => true
        )
    );
    exchange1 = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "primaryEx",
        Symbol("markets") => sampleMarket
    ));
    exchange2 = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "primaryEx"
    ));
    @test functions.ccxtruthy(functions.ccxt_gt(length(objectKeys(get(exchange1, Symbol("markets"), nothing))), 0))
    differentExchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "secondaryEx"
    ));
    try
        setMarketsFromExchange(differentExchange, exchange1);
        @test !functions.ccxtruthy(trueClause)
    catch e
        @test functions.ccxtruthy(trueClause);
    end
    nonloadedExchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "primaryEx"
    ));
    try
        setMarketsFromExchange(exchange2, nonloadedExchange);
        @test !functions.ccxtruthy(trueClause)
    catch e
        @test functions.ccxtruthy(trueClause);
    end
    setMarketsFromExchange(exchange2, exchange1);
    neededProps = ["symbols", "currencies", "codes", "markets", "ids", "markets_by_id", "currencies_by_id", "baseCurrencies", "quoteCurrencies"];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(neededProps)))
        assertDeepEqual(testSharedMethods, emptyExchange, Dict{Symbol, Any}(), methodName, getProperty(emptyExchange, exchange1, get(neededProps, i + 1, nothing)), getProperty(emptyExchange, exchange2, get(neededProps, i + 1, nothing)));
        i += 1
    end
    startTime = milliseconds(emptyExchange);
    Base.fetch(loadMarkets(exchange2));
    endTime = milliseconds(emptyExchange);
    timeTaken = endTime - startTime;
    @test functions.ccxtruthy(functions.ccxt_lt(timeTaken, 10))
    describe(emptyExchange);
end
