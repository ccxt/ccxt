using Test
using Ccxt
function testArraysConcat()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    assertDeepEqual(testSharedMethods, exchange, nothing, "testArraysConcat", arraysConcat(exchange, [["b"], ["a", "c"]]), ["b", "a", "c"]);
end
