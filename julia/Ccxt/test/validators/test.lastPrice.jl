using Test
using Ccxt
function testLastPrice(exchange, skippedProperties, method, entry, symbol)

    format = Dict{Symbol, Any}(
        Symbol("info") => Dict{Symbol, Any}(),
        Symbol("symbol") => "ETH/BTC",
        Symbol("timestamp") => 1502962946216,
        Symbol("datetime") => "2017-09-01T00:00:00",
        Symbol("price") => parseNumber(exchange, "1.234"),
        Symbol("side") => "buy"
    );
    emptyAllowedFor = ["timestamp", "datetime", "side", "price"];
    assertStructure(testSharedMethods, exchange, skippedProperties, method, entry, format, emptyAllowedFor);
    assertTimestampAndDatetime(testSharedMethods, exchange, skippedProperties, method, entry);
    assertGreater(testSharedMethods, exchange, skippedProperties, method, entry, "price", "0");
    assertInArray(testSharedMethods, exchange, skippedProperties, method, entry, "side", ["buy", "sell", nothing]);
end
