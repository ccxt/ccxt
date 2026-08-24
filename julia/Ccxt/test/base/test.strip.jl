using Test
using Ccxt
function testStrip()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    @test strip(exchange, " asd") == "asd";
    @test strip(exchange, "    asd") == "asd";
    @test strip(exchange, "asd ") == "asd";
    @test strip(exchange, "asd    ") == "asd";
    @test strip(exchange, " asd ") == "asd";
    @test strip(exchange, "    asd    ") == "asd";
    @test strip(exchange, "asd") == "asd";
    @test strip(exchange, "") == "";
end
