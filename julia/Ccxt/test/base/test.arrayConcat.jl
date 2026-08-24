using Test
using Ccxt
function testArrayConcat()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    assertDeepEqual(testSharedMethods, exchange, nothing, "testArrayConcat", arrayConcat(exchange, ["b"], ["a", "c"]), ["b", "a", "c"]);
end
