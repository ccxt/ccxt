using Test
using Ccxt
function testPrecisionFromString()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    @test precisionFromString(exchange, "1e-4") == 4;
    @test precisionFromString(exchange, "1E-4") == 4;
    @test precisionFromString(exchange, "1e-8") == 8;
    @test precisionFromString(exchange, "2.5e-6") == 6;
    @test precisionFromString(exchange, "1e4") == -4;
    @test precisionFromString(exchange, "1e+4") == -4;
    @test precisionFromString(exchange, "0.0001") == 4;
    @test precisionFromString(exchange, "0.00001") == 5;
    @test precisionFromString(exchange, "0.1") == 1;
    @test precisionFromString(exchange, "0.01") == 2;
    @test precisionFromString(exchange, "0.00000001") == 8;
    @test precisionFromString(exchange, "0.0100") == 2;
    @test precisionFromString(exchange, "0.00100") == 3;
    @test precisionFromString(exchange, "1.0000") == 0;
    @test precisionFromString(exchange, "1") == 0;
    @test precisionFromString(exchange, "10") == 0;
    @test precisionFromString(exchange, "100") == 0;
    @test precisionFromString(exchange, "0.0") == 0;
    @test precisionFromString(exchange, "1.0") == 0;
    @test precisionFromString(exchange, "0.12345") == 5;
end
