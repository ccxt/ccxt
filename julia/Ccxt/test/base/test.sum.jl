using Test
using Ccxt
function testSum()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    assertDeepEqual(testSharedMethods, exchange, nothing, "testSum", sum(exchange, 2), 2);
    assertDeepEqual(testSharedMethods, exchange, nothing, "testSum", sum(exchange, 2, 30, 400), 432);
end
