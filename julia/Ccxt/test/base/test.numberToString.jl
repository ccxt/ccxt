using Test
using Ccxt
function testNumberToString()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "regirock"
    ));
    @test numberToString(exchange, -7.8e-7) == "-0.00000078";
    @test numberToString(exchange, 7.8e-7) == "0.00000078";
    @test numberToString(exchange, -0.0000017805) == "-0.0000017805";
    @test numberToString(exchange, 0.0000017805) == "0.0000017805";
    @test numberToString(exchange, -7.0005e+27) == "-7000500000000000000000000000";
    @test numberToString(exchange, 7.0005e+27) == "7000500000000000000000000000";
    @test numberToString(exchange, -7.9e+27) == "-7900000000000000000000000000";
    @test numberToString(exchange, 7e+27) == "7000000000000000000000000000";
    @test numberToString(exchange, 7.9e+27) == "7900000000000000000000000000";
    @test numberToString(exchange, -12.345) == "-12.345";
    @test numberToString(exchange, 12.345) == "12.345";
    @test numberToString(exchange, 0) == "0";
    @test numberToString(exchange, 7.35946e+21) == "7359460000000000000000";
    @test numberToString(exchange, 1e-8) == "0.00000001";
    @test numberToString(exchange, 1e-7) == "0.0000001";
    @test numberToString(exchange, -1e-7) == "-0.0000001";
end
