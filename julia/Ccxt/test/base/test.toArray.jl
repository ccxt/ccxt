using Test
using Ccxt
function testToArray()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    obj1 = Dict{Symbol, Any}(
        Symbol("a") => 1,
        Symbol("b") => 3,
        Symbol("c") => 2
    );
    obj2 = Dict{Symbol, Any}(
        Symbol("a") => "x",
        Symbol("b") => 2
    );
    result1 = toArray(exchange, obj1);
    result2 = toArray(exchange, obj2);
    @test length(result1) == 3
    @test length(result2) == 2
    @test functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(inArray(exchange, 1, result1), inArray(exchange, 3, result1)), inArray(exchange, 2, result1)))
    @test functions.ccxtruthy(@functions.ccxt_and(inArray(exchange, "x", result2), inArray(exchange, 2, result2)))
end
