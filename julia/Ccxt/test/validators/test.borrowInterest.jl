using Test
using Ccxt
function testBorrowInterest(exchange, skippedProperties, method, entry, requestedCode, requestedSymbol)

    format = Dict{Symbol, Any}(
        Symbol("info") => Dict{Symbol, Any}(),
        Symbol("account") => "BTC/USDT",
        Symbol("currency") => "USDT",
        Symbol("interest") => parseNumber(exchange, "0.1444"),
        Symbol("interestRate") => parseNumber(exchange, "0.0006"),
        Symbol("amountBorrowed") => parseNumber(exchange, "30.0"),
        Symbol("timestamp") => 1638230400000,
        Symbol("datetime") => "2021-11-30T00:00:00.000Z"
    );
    emptyAllowedFor = ["account"];
    assertStructure(testSharedMethods, exchange, skippedProperties, method, entry, format, emptyAllowedFor);
    assertTimestampAndDatetime(testSharedMethods, exchange, skippedProperties, method, entry);
    assertCurrencyCode(testSharedMethods, exchange, skippedProperties, method, entry, get(entry, Symbol("currency"), nothing), requestedCode);
    assertSymbol(testSharedMethods, exchange, skippedProperties, method, entry, get(entry, Symbol("account"), nothing), requestedSymbol);
    assertGreater(testSharedMethods, exchange, skippedProperties, method, entry, "interest", "0");
    assertGreater(testSharedMethods, exchange, skippedProperties, method, entry, "interestRate", "0");
    assertGreater(testSharedMethods, exchange, skippedProperties, method, entry, "amountBorrowed", "0");
end
