using Test
using Ccxt
function testFetchHistoryBase()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange",
        Symbol("fetchHistoryCacheSize") => 2
    ));
    @test exchangeProp(testSharedMethods, exchange, "fetchHistoryCacheSize") == 2
    trueAssertion = parseNumber(exchange, nothing) == nothing;
    try
        Base.fetch(fetch2(exchange, "sample1"));
    catch e
        @test functions.ccxtruthy(trueAssertion);
    end
    @test length((getFetchCache(exchange))) == 1
    try
        Base.fetch(fetch2(exchange, "sample2"));
    catch e
        @test functions.ccxtruthy(trueAssertion);
    end
    @test length((getFetchCache(exchange))) == 2
    try
        Base.fetch(fetch2(exchange, "sample3"));
    catch e
        @test functions.ccxtruthy(trueAssertion);
    end
    @test length((getFetchCache(exchange))) == 2
    @test functions.ccxtruthy(functions.ccxt_lt(1 + 1, 3));
end


function testFetchHistory()

    Base.fetch(testFetchHistoryBase());
end
