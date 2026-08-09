using Test
using Ccxt
function testUrlencodeWithArrayRepeat()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    dict2 = Dict{Symbol, Any}(
        Symbol("a") => 1,
        Symbol("product_ids") => ["AA", "BB"]
    );
    expected2a = "a=1&product_ids=AA&product_ids=BB";
    expected2b = "product_ids=AA&product_ids=BB&a=1";
    result2 = urlencodeWithArrayRepeat(exchange, dict2);
    @test functions.ccxtruthy(@functions.ccxt_or(result2 == expected2a, result2 == expected2b))
end
