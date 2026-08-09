using Test
using Ccxt
function testBorrowRate(exchange, skippedProperties, method, entry, requestedCode)

    format = Dict{Symbol, Any}(
        Symbol("info") => Dict{Symbol, Any}(),
        Symbol("currency") => "USDT",
        Symbol("timestamp") => 1638230400000,
        Symbol("datetime") => "2021-11-30T00:00:00.000Z",
        Symbol("rate") => parseNumber(exchange, "0.0006"),
        Symbol("period") => 86400000
    );
    assertStructure(testSharedMethods, exchange, skippedProperties, method, entry, format);
    assertTimestampAndDatetime(testSharedMethods, exchange, skippedProperties, method, entry);
    assertCurrencyCode(testSharedMethods, exchange, skippedProperties, method, entry, get(entry, Symbol("currency"), nothing), requestedCode);
    assertGreater(testSharedMethods, exchange, skippedProperties, method, entry, "period", "0");
    assertGreater(testSharedMethods, exchange, skippedProperties, method, entry, "rate", "0");
end
