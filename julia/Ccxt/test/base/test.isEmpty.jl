using Test
using Ccxt
function testIsEmpty()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    @test functions.ccxtruthy(isEmpty(exchange, nothing))
    @test functions.ccxtruthy(isEmpty(exchange, nothing))
    @test functions.ccxtruthy(isEmpty(exchange, Dict{Symbol, Any}()))
    @test functions.ccxtruthy(isEmpty(exchange, []))
    @test isEmpty(exchange, Dict{Symbol, Any}(
    Symbol("foo") => 1
)) == false
    @test isEmpty(exchange, [1, 2]) == false
    @test isEmpty(exchange, "") == false
    @test isEmpty(exchange, 0) == false
    @test isEmpty(exchange, false) == false
    @test isEmpty(exchange, "non-empty string") == false
end
