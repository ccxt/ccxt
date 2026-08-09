using Test
using Ccxt
function testGroupBy()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    sampleArray = [Dict{Symbol, Any}(
        Symbol("foo") => "a"
    ), Dict{Symbol, Any}(
        Symbol("foo") => "b"
    ), Dict{Symbol, Any}(
        Symbol("foo") => "c"
    ), Dict{Symbol, Any}(
        Symbol("foo") => "b"
    ), Dict{Symbol, Any}(
        Symbol("foo") => "c"
    ), Dict{Symbol, Any}(
        Symbol("foo") => "c"
    )];
    currentValue = groupBy(exchange, sampleArray, "foo");
    storedValue = Dict{Symbol, Any}(
        Symbol("a") => [Dict{Symbol, Any}(
        Symbol("foo") => "a"
    )],
        Symbol("b") => [Dict{Symbol, Any}(
        Symbol("foo") => "b"
    ), Dict{Symbol, Any}(
        Symbol("foo") => "b"
    )],
        Symbol("c") => [Dict{Symbol, Any}(
        Symbol("foo") => "c"
    ), Dict{Symbol, Any}(
        Symbol("foo") => "c"
    ), Dict{Symbol, Any}(
        Symbol("foo") => "c"
    )]
    );
    assertDeepEqual(testSharedMethods, exchange, nothing, "testGroupBy", currentValue, storedValue);
end
