using Test
using Ccxt
function testOmit()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    assertDeepEqual(testSharedMethods, exchange, nothing, "testOmit", omit(exchange, Dict{Symbol, Any}(), "foo"), Dict{Symbol, Any}());
    assertDeepEqual(testSharedMethods, exchange, nothing, "testOmit", omit(exchange, Dict{Symbol, Any}(
    Symbol("foo") => 2
), "foo"), Dict{Symbol, Any}());
    assertDeepEqual(testSharedMethods, exchange, nothing, "testOmit", omit(exchange, Dict{Symbol, Any}(
    Symbol("foo") => 2,
    Symbol("bar") => 3
), "foo"), Dict{Symbol, Any}(
    Symbol("bar") => 3
));
    assertDeepEqual(testSharedMethods, exchange, nothing, "testOmit", omit(exchange, Dict{Symbol, Any}(
    Symbol("foo") => 2,
    Symbol("bar") => 3
), ["foo"]), Dict{Symbol, Any}(
    Symbol("bar") => 3
));
end
