using Test
using Ccxt
function testTradingFee(exchange, skippedProperties, method, symbol, entry)

    format = Dict{Symbol, Any}(
        Symbol("info") => Dict{Symbol, Any}(),
        Symbol("symbol") => "ETH/BTC",
        Symbol("maker") => parseNumber(exchange, "0.002"),
        Symbol("taker") => parseNumber(exchange, "0.003")
    );
    emptyAllowedFor = ["tierBased", "percentage", "symbol"];
    assertStructure(testSharedMethods, exchange, skippedProperties, method, entry, format, emptyAllowedFor);
    assertSymbol(testSharedMethods, exchange, skippedProperties, method, entry, "symbol", symbol);
end
