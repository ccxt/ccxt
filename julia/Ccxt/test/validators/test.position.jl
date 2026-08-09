using Test
using Ccxt
function testPosition(exchange, skippedProperties, method, entry, symbol, now)

    format = Dict{Symbol, Any}(
        Symbol("info") => Dict{Symbol, Any}(),
        Symbol("symbol") => "XYZ/USDT",
        Symbol("timestamp") => 1504224000000,
        Symbol("datetime") => "2017-09-01T00:00:00",
        Symbol("initialMargin") => parseNumber(exchange, "1.234"),
        Symbol("initialMarginPercentage") => parseNumber(exchange, "0.123"),
        Symbol("maintenanceMargin") => parseNumber(exchange, "1.234"),
        Symbol("maintenanceMarginPercentage") => parseNumber(exchange, "0.123"),
        Symbol("entryPrice") => parseNumber(exchange, "1.234"),
        Symbol("notional") => parseNumber(exchange, "1.234"),
        Symbol("leverage") => parseNumber(exchange, "1.234"),
        Symbol("unrealizedPnl") => parseNumber(exchange, "1.234"),
        Symbol("contracts") => parseNumber(exchange, "1"),
        Symbol("contractSize") => parseNumber(exchange, "1.234"),
        Symbol("marginRatio") => parseNumber(exchange, "1.234"),
        Symbol("liquidationPrice") => parseNumber(exchange, "1.234"),
        Symbol("markPrice") => parseNumber(exchange, "1.234"),
        Symbol("collateral") => parseNumber(exchange, "1.234"),
        Symbol("marginMode") => "cross",
        Symbol("side") => "long",
        Symbol("percentage") => parseNumber(exchange, "1.234")
    );
    emptyotAllowedFor = ["liquidationPrice", "initialMargin", "initialMarginPercentage", "maintenanceMargin", "maintenanceMarginPercentage", "marginRatio"];
    assertStructure(testSharedMethods, exchange, skippedProperties, method, entry, format, emptyotAllowedFor);
    assertTimestampAndDatetime(testSharedMethods, exchange, skippedProperties, method, entry, now);
    assertSymbol(testSharedMethods, exchange, skippedProperties, method, entry, "symbol", symbol);
    assertInArray(testSharedMethods, exchange, skippedProperties, method, entry, "side", ["long", "short"]);
    assertInArray(testSharedMethods, exchange, skippedProperties, method, entry, "marginMode", ["cross", "isolated"]);
    assertGreater(testSharedMethods, exchange, skippedProperties, method, entry, "leverage", "0");
    assertLessOrEqual(testSharedMethods, exchange, skippedProperties, method, entry, "leverage", "200");
    assertGreater(testSharedMethods, exchange, skippedProperties, method, entry, "initialMargin", "0");
    assertGreater(testSharedMethods, exchange, skippedProperties, method, entry, "initialMarginPercentage", "0");
    assertGreater(testSharedMethods, exchange, skippedProperties, method, entry, "maintenanceMargin", "0");
    assertGreater(testSharedMethods, exchange, skippedProperties, method, entry, "maintenanceMarginPercentage", "0");
    assertGreater(testSharedMethods, exchange, skippedProperties, method, entry, "entryPrice", "0");
    assertGreater(testSharedMethods, exchange, skippedProperties, method, entry, "notional", "0");
    assertGreater(testSharedMethods, exchange, skippedProperties, method, entry, "contracts", "0");
    assertGreater(testSharedMethods, exchange, skippedProperties, method, entry, "contractSize", "0");
    assertGreater(testSharedMethods, exchange, skippedProperties, method, entry, "marginRatio", "0");
    assertGreater(testSharedMethods, exchange, skippedProperties, method, entry, "liquidationPrice", "0");
    assertGreater(testSharedMethods, exchange, skippedProperties, method, entry, "markPrice", "0");
    assertGreater(testSharedMethods, exchange, skippedProperties, method, entry, "collateral", "0");
end
