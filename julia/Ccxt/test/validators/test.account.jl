using Test
using Ccxt
function testAccount(exchange, skippedProperties, method, entry)

    format = Dict{Symbol, Any}(
        Symbol("info") => Dict{Symbol, Any}(),
        Symbol("code") => "BTC",
        Symbol("type") => "spot",
        Symbol("id") => "12345"
    );
    emptyAllowedFor = ["code", "id"];
    assertStructure(testSharedMethods, exchange, skippedProperties, method, entry, format, emptyAllowedFor);
    assertCurrencyCode(testSharedMethods, exchange, skippedProperties, method, entry, get(entry, Symbol("code"), nothing));
end
