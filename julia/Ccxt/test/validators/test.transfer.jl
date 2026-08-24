using Test
using Ccxt
function testTransfer(exchange, skippedProperties, method, entry, requestedCode)

    format = Dict{Symbol, Any}(
        Symbol("info") => Dict{Symbol, Any}(),
        Symbol("id") => "1234",
        Symbol("timestamp") => 1502962946216,
        Symbol("datetime") => "2017-08-17 12:42:48.000",
        Symbol("currency") => "USDT",
        Symbol("amount") => parseNumber(exchange, "1.234"),
        Symbol("fromAccount") => "spot",
        Symbol("toAccount") => "swap",
        Symbol("status") => "ok"
    );
    emptyAllowedFor = ["fromAccount", "toAccount"];
    assertStructure(testSharedMethods, exchange, skippedProperties, method, entry, format, emptyAllowedFor);
    assertTimestampAndDatetime(testSharedMethods, exchange, skippedProperties, method, entry, milliseconds(exchange));
    assertCurrencyCode(testSharedMethods, exchange, skippedProperties, method, entry, get(entry, Symbol("currency"), nothing), requestedCode);
    assertInArray(testSharedMethods, exchange, skippedProperties, method, entry, "status", ["ok", "pending", "failed"]);
    assertGreaterOrEqual(testSharedMethods, exchange, skippedProperties, method, entry, "amount", "0");
end
