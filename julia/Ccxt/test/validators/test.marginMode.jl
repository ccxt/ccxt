using Test
using Ccxt
function testMarginMode(exchange, skippedProperties, method, entry)

    format = Dict{Symbol, Any}(
        Symbol("info") => Dict{Symbol, Any}(),
        Symbol("symbol") => "BTC/USDT:USDT",
        Symbol("marginMode") => "cross"
    );
    emptyAllowedFor = ["symbol"];
    assertStructure(testSharedMethods, exchange, skippedProperties, method, entry, format, emptyAllowedFor);
end
