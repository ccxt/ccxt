using Test
using Ccxt
function testInArray()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "regirock"
    ));
    array = [1, 2, 3];
    @test functions.ccxtruthy(inArray(exchange, 1, array));
    @test functions.ccxtruthy(inArray(exchange, 2, array));
    @test functions.ccxtruthy(inArray(exchange, 3, array));
    @test inArray(exchange, 4, array) == false;
end
