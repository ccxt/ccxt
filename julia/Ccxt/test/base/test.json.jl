using Test
using Ccxt
function testJson()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "regirock"
    ));
    obj = Dict{Symbol, Any}(
        Symbol("k") => "v"
    );
    objJson = json(exchange, obj);
    @test objJson == "{\"k\":\"v\"}";
    list = [1, 2];
    listJson = json(exchange, list);
    @test listJson == "[1,2]";
end
