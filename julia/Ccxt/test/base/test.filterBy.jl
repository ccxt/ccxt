using Test
using Ccxt
function testFilterBy()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    sampleArray = [Dict{Symbol, Any}(
        Symbol("foo") => "a"
    ), Dict{Symbol, Any}(
        Symbol("foo") => nothing
    ), Dict{Symbol, Any}(
        Symbol("foo") => "b"
    ), Dict{Symbol, Any}(
        Symbol("foo") => "a",
        Symbol("bar") => "b"
    ), Dict{Symbol, Any}(
        Symbol("foo") => "c"
    ), Dict{Symbol, Any}(
        Symbol("foo") => "d"
    ), Dict{Symbol, Any}(
        Symbol("foo") => "b"
    ), Dict{Symbol, Any}(
        Symbol("foo") => "c"
    ), Dict{Symbol, Any}(
        Symbol("foo") => "c"
    )];
    currentValue = filterBy(exchange, sampleArray, "foo", "a");
    storedValue = [Dict{Symbol, Any}(
        Symbol("foo") => "a"
    ), Dict{Symbol, Any}(
        Symbol("foo") => "a",
        Symbol("bar") => "b"
    )];
    assertDeepEqual(testSharedMethods, exchange, nothing, "testFilterBy", currentValue, storedValue);
end
