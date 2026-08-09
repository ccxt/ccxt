using Test
using Ccxt
function testLeverageTier(exchange, skippedProperties, method, entry)

    format = Dict{Symbol, Any}(
        Symbol("tier") => parseNumber(exchange, "1"),
        Symbol("minNotional") => parseNumber(exchange, "0"),
        Symbol("maxNotional") => parseNumber(exchange, "5000"),
        Symbol("maintenanceMarginRate") => parseNumber(exchange, "0.01"),
        Symbol("maxLeverage") => parseNumber(exchange, "25"),
        Symbol("info") => Dict{Symbol, Any}()
    );
    emptyAllowedFor = ["maintenanceMarginRate"];
    assertStructure(testSharedMethods, exchange, skippedProperties, method, entry, format, emptyAllowedFor);
    assertGreaterOrEqual(testSharedMethods, exchange, skippedProperties, method, entry, "tier", "0");
    assertGreaterOrEqual(testSharedMethods, exchange, skippedProperties, method, entry, "minNotional", "0");
    assertGreaterOrEqual(testSharedMethods, exchange, skippedProperties, method, entry, "maxNotional", "0");
    assertGreaterOrEqual(testSharedMethods, exchange, skippedProperties, method, entry, "maxLeverage", "1");
    assertLessOrEqual(testSharedMethods, exchange, skippedProperties, method, entry, "maintenanceMarginRate", "1");
end
