using Test
using Ccxt
function testAggregate()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    @test functions.ccxtruthy(functions.ccxt_gt(milliseconds(exchange), 0));
    bids = [[789.1, 111.05], [789.1, 111.05], [123.3, 456.2], [784.2, 111.05], [789.1, 111.05]];
    expectedBids = [[123.3, 456.2], [784.2, 111.05], [789.1, 333.15]];
    assertDeepEqual(testSharedMethods, exchange, nothing, "aggregate", aggregate(exchange, sortBy(exchange, bids, 0)), expectedBids);
    asks = [[123.2, 456.2], [784.2, 222.44], [789.1, 111.01]];
    expectedAsks = [[123.2, 456.2], [784.2, 222.44], [789.1, 111.01]];
    assertDeepEqual(testSharedMethods, exchange, nothing, "aggregate", aggregate(exchange, sortBy(exchange, asks, 0)), expectedAsks);
    assertDeepEqual(testSharedMethods, exchange, nothing, "aggregate", aggregate(exchange, []), []);
    result1 = aggregate(exchange, [[100.2, 1.01], [101.5, 2.01], [100.2, 0.5]]);
    assertDeepEqual(testSharedMethods, exchange, nothing, "testAggregate", result1, [[100.2, 1.51], [101.5, 2.01]]);
    result2 = aggregate(exchange, [[100.2, 1.01, "extra"], [101.5, 2.01, "data", "more"]]);
    assertDeepEqual(testSharedMethods, exchange, nothing, "testAggregate", result2, [[100.2, 1.01], [101.5, 2.01]]);
    result3 = aggregate(exchange, [[100.2, 1.01], [101.5, 0], [102.4, 2.01]]);
    assertDeepEqual(testSharedMethods, exchange, nothing, "testAggregate", result3, [[100.2, 1.01], [102.4, 2.01]]);
    result4 = aggregate(exchange, []);
    assertDeepEqual(testSharedMethods, exchange, nothing, "testAggregate", result4, []);
    result5 = aggregate(exchange, [[100.2, 1.01]]);
    assertDeepEqual(testSharedMethods, exchange, nothing, "testAggregate", result5, [[100.2, 1.01]]);
    result6 = aggregate(exchange, [[100.2, 0.12], [100.2, 0.2], [100.2, 0.3], [100.2, 0.4]]);
    assertDeepEqual(testSharedMethods, exchange, nothing, "testAggregate", result6, [[100.2, 1.02]]);
    result7 = aggregate(exchange, [[100.2, 0], [101.5, 0], [102.4, 0]]);
    assertDeepEqual(testSharedMethods, exchange, nothing, "testAggregate", result7, []);
    result9 = aggregate(exchange, [[100.5, 1.04], [100.5, 2.04], [101.5, 1.05]]);
    assertDeepEqual(testSharedMethods, exchange, nothing, "testAggregate", result9, [[100.5, 3.08], [101.5, 1.05]]);
    result10 = aggregate(exchange, [[100.2, 1.04], [100.2, 0], [100.2, 2.04]]);
    assertDeepEqual(testSharedMethods, exchange, nothing, "testAggregate", result10, [[100.2, 3.08]]);
    uuid(exchange);
end
