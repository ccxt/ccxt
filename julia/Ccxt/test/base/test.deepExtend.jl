using Test
using Ccxt
function testDeepExtend()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    obj1 = Dict{Symbol, Any}(
        Symbol("a") => 1,
        Symbol("b") => [1, 2, 3],
        Symbol("c") => [Dict{Symbol, Any}(
        Symbol("test1") => 1,
        Symbol("test2") => 1
    )],
        Symbol("d") => nothing,
        Symbol("e") => "not_undefined",
        Symbol("sub") => Dict{Symbol, Any}(
            Symbol("a") => 1,
            Symbol("b") => [1, 2],
            Symbol("c") => [Dict{Symbol, Any}(
        Symbol("test1") => 1,
        Symbol("test2") => 2
    )],
            Symbol("d") => nothing,
            Symbol("e") => "not_undefined",
            Symbol("other1") => "x"
        ),
        Symbol("other1") => "x"
    );
    obj2 = Dict{Symbol, Any}(
        Symbol("a") => 2,
        Symbol("b") => [3, 4],
        Symbol("c") => [Dict{Symbol, Any}(
        Symbol("test1") => 2,
        Symbol("test3") => 3
    )],
        Symbol("d") => "not_undefined",
        Symbol("e") => nothing,
        Symbol("sub") => Dict{Symbol, Any}(
            Symbol("a") => 2,
            Symbol("b") => [3, 4],
            Symbol("c") => [Dict{Symbol, Any}(
        Symbol("test1") => 2,
        Symbol("test3") => 3
    )],
            Symbol("d") => "not_undefined",
            Symbol("e") => nothing,
            Symbol("other2") => "y"
        ),
        Symbol("other2") => "y"
    );
    deepExtended = deepExtend(exchange, obj1, obj2);
    compareTo = Dict{Symbol, Any}(
        Symbol("a") => 2,
        Symbol("b") => [3, 4],
        Symbol("c") => [Dict{Symbol, Any}(
        Symbol("test1") => 2,
        Symbol("test3") => 3
    )],
        Symbol("d") => "not_undefined",
        Symbol("e") => nothing,
        Symbol("sub") => Dict{Symbol, Any}(
            Symbol("a") => 2,
            Symbol("b") => [3, 4],
            Symbol("c") => [Dict{Symbol, Any}(
        Symbol("test1") => 2,
        Symbol("test3") => 3
    )],
            Symbol("d") => "not_undefined",
            Symbol("e") => nothing,
            Symbol("other1") => "x",
            Symbol("other2") => "y"
        ),
        Symbol("other1") => "x",
        Symbol("other2") => "y"
    );
    assertDeepEqual(testSharedMethods, exchange, nothing, "testDeepExtend", deepExtended, compareTo);
end
