using Test
using Ccxt
function testUrlencodeNested()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    dict2 = Dict{Symbol, Any}(
        Symbol("b") => Dict{Symbol, Any}(
            Symbol("c") => 2,
            Symbol("target") => "+&"
        ),
        Symbol("d") => [1, 2]
    );
    expected2a = "b[c]=2&b[target]=%2B%26&d[0]=1&d[1]=2";
    expected2c = "b[target]=%2B%26&b[c]=2&d[0]=1&d[1]=2";
    expected2b = "d[0]=1&d[1]=2&b[c]=2&b[target]=%2B%26";
    expected2d = "d[0]=1&d[1]=2&b[target]=%2B%26&b[c]=2";
    result2 = urlencodeNested(exchange, dict2);
    @test functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or(result2 == expected2a, result2 == expected2b), result2 == expected2c), result2 == expected2d))
end
