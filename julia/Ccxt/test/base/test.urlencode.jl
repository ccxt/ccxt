using Test
using Ccxt
function testUrlencode()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    dict1 = Dict{Symbol, Any}(
        Symbol("a") => 1,
        Symbol("c") => "+&"
    );
    expected1 = "a=1&c=%2B%26";
    expected2 = "c=%2B%26&a=1";
    encoded = urlencode(exchange, dict1);
    @test functions.ccxtruthy(@functions.ccxt_or(encoded == expected1, encoded == expected2))
end
