using Test
using Ccxt
function testRawencode()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    dict2 = Dict{Symbol, Any}(
        Symbol("a") => 1,
        Symbol("b") => "+&"
    );
    expected2a = "a=1&b=+&";
    expected2b = "b=+&&a=1";
    result2 = rawencode(exchange, dict2);
    @test functions.ccxtruthy(@functions.ccxt_or(result2 == expected2a, result2 == expected2b))
end
