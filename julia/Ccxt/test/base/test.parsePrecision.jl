using Test
using Ccxt
function testParsePrecision()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    @test parsePrecision(exchange, "15") == "0.000000000000001";
    @test parsePrecision(exchange, "1") == "0.1";
    @test parsePrecision(exchange, "0") == "1";
    @test parsePrecision(exchange, "-5") == "100000";
end
