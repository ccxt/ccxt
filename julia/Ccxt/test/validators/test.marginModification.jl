using Test
using Ccxt
function testMarginModification(exchange, skippedProperties, method, entry)

    format = Dict{Symbol, Any}(
        Symbol("info") => Dict{Symbol, Any}(),
        Symbol("type") => "add",
        Symbol("amount") => parseNumber(exchange, "0.1"),
        Symbol("total") => parseNumber(exchange, "0.29934828"),
        Symbol("code") => "USDT",
        Symbol("symbol") => "ADA/USDT:USDT",
        Symbol("status") => "ok"
    );
    emptyAllowedFor = ["status", "symbol", "code", "total", "amount"];
    assertStructure(testSharedMethods, exchange, skippedProperties, method, entry, format, emptyAllowedFor);
    assertCurrencyCode(testSharedMethods, exchange, skippedProperties, method, entry, get(entry, Symbol("code"), nothing));
    assertGreaterOrEqual(testSharedMethods, exchange, skippedProperties, method, entry, "amount", "0");
    assertGreaterOrEqual(testSharedMethods, exchange, skippedProperties, method, entry, "total", "0");
    assertInArray(testSharedMethods, exchange, skippedProperties, method, entry, "type", ["add", "reduce", "set"]);
    assertInArray(testSharedMethods, exchange, skippedProperties, method, entry, "status", ["ok", "pending", "canceled", "failed"]);
    assertSymbol(testSharedMethods, exchange, skippedProperties, method, entry, "symbol");
end
