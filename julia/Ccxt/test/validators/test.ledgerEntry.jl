using Test
using Ccxt
function testLedgerEntry(exchange, skippedProperties, method, entry, requestedCode, now)

    format = Dict{Symbol, Any}(
        Symbol("info") => Dict{Symbol, Any}(),
        Symbol("id") => "x1234",
        Symbol("currency") => "BTC",
        Symbol("account") => "spot",
        Symbol("referenceId") => "foo",
        Symbol("referenceAccount") => "bar",
        Symbol("status") => "ok",
        Symbol("amount") => parseNumber(exchange, "22"),
        Symbol("before") => parseNumber(exchange, "111"),
        Symbol("after") => parseNumber(exchange, "133"),
        Symbol("fee") => Dict{Symbol, Any}(),
        Symbol("direction") => "in",
        Symbol("timestamp") => 1638230400000,
        Symbol("datetime") => "2021-11-30T00:00:00.000Z",
        Symbol("type") => "deposit"
    );
    emptyAllowedFor = ["referenceId", "referenceAccount", "id"];
    assertStructure(testSharedMethods, exchange, skippedProperties, method, entry, format, emptyAllowedFor);
    assertTimestampAndDatetime(testSharedMethods, exchange, skippedProperties, method, entry, now);
    assertCurrencyCode(testSharedMethods, exchange, skippedProperties, method, entry, get(entry, Symbol("currency"), nothing), requestedCode);
    assertInArray(testSharedMethods, exchange, skippedProperties, method, entry, "direction", ["in", "out"]);
    assertInArray(testSharedMethods, exchange, skippedProperties, method, entry, "type", ["trade", "transaction", "margin", "cashback", "referral", "transfer", "fee"]);
    assertGreaterOrEqual(testSharedMethods, exchange, skippedProperties, method, entry, "amount", "0");
    assertGreaterOrEqual(testSharedMethods, exchange, skippedProperties, method, entry, "before", "0");
    assertGreaterOrEqual(testSharedMethods, exchange, skippedProperties, method, entry, "after", "0");
end
