using Test
using Ccxt
function testFundingRateHistory(exchange, skippedProperties, method, entry, symbol)

    format = Dict{Symbol, Any}(
        Symbol("info") => Dict{Symbol, Any}(),
        Symbol("symbol") => "BTC/USDT:USDT",
        Symbol("timestamp") => 1638230400000,
        Symbol("datetime") => "2021-11-30T00:00:00.000Z",
        Symbol("fundingRate") => parseNumber(exchange, "0.0006")
    );
    assertStructure(testSharedMethods, exchange, skippedProperties, method, entry, format);
    assertSymbol(testSharedMethods, exchange, skippedProperties, method, entry, "symbol", symbol);
    assertTimestampAndDatetime(testSharedMethods, exchange, skippedProperties, method, entry);
    assertGreater(testSharedMethods, exchange, skippedProperties, method, entry, "fundingRate", "-100");
    assertLess(testSharedMethods, exchange, skippedProperties, method, entry, "fundingRate", "100");
end
