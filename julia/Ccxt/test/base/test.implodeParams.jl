using Test
using Ccxt
function testImplodeParams()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    path = "v2/watchlists/{timeframe_id}/{symbol_id}";
    params = Dict{Symbol, Any}(
        Symbol("timeframe_id") => "1m",
        Symbol("symbol_id") => "BTC/USDT",
        Symbol("extra_param") => "should_be_ignored"
    );
    expected = "v2/watchlists/1m/BTC/USDT";
    result = implodeParams(exchange, path, params);
    @test result == expected
end
