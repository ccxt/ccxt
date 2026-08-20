using Test
using Ccxt
function testUnique()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    assertDeepEqual(testSharedMethods, exchange, nothing, "testUnique", unique(exchange, []), []);
    assertDeepEqual(testSharedMethods, exchange, nothing, "testUnique", sort!(unique(exchange, ["a", "a", "b", "c", "a", "c"]), exchange), ["a", "b", "c"]);
end
