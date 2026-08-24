using Test
using Ccxt
function testSort()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    assertDeepEqual(testSharedMethods, exchange, nothing, "sort", sort!([], exchange), []);
    assertDeepEqual(testSharedMethods, exchange, nothing, "sort", sort!(["a"], exchange), ["a"]);
    assertDeepEqual(testSharedMethods, exchange, nothing, "sort", sort!(["a", "b", "c"], exchange), ["a", "b", "c"]);
    assertDeepEqual(testSharedMethods, exchange, nothing, "sort", sort!(["b", "a", "b", "c"], exchange), ["a", "b", "b", "c"]);
    assertDeepEqual(testSharedMethods, exchange, nothing, "sort", sort!(["b", "a", "c", "d"], exchange), ["a", "b", "c", "d"]);
    original = ["b", "a", "c"];
    sort!(original, exchange);
    assertDeepEqual(testSharedMethods, exchange, nothing, "sort", original, ["b", "a", "c"]);
end
