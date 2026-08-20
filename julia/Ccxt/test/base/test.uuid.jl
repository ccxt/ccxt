using Test
using Ccxt
function testUuid()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    id1 = uuid(exchange);
    id2 = uuid(exchange);
    @test id1 != nothing
    @test id2 != nothing
    @test id1 != id2
    @test string(id1) == id1
    @test string(id2) == id2
    @test length(id1) == 36
    @test length(id2) == 36
    @test ccxt_indexOf("-", id1) == 8
    id16a = uuid16(exchange);
    id16b = uuid16(exchange);
    @test id16a != nothing
    @test id16b != nothing
    @test id16a != id16b
    @test string(id16a) == id16a
    @test string(id16b) == id16b
    @test length(id16a) == 16
    @test length(id16b) == 16
    id22a = uuid22(exchange);
    id22b = uuid22(exchange);
    @test id22a != nothing
    @test id22b != nothing
    @test id22a != id22b
    @test string(id22a) == id22a
    @test string(id22b) == id22b
    @test length(id22a) == 22
    @test length(id22b) == 22
end
