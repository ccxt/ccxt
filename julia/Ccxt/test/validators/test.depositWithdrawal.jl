using Test
using Ccxt
function testDepositWithdrawal(exchange, skippedProperties, method, entry, requestedCode, now)

    format = Dict{Symbol, Any}(
        Symbol("info") => Dict{Symbol, Any}(),
        Symbol("id") => "1234",
        Symbol("txid") => "0x1345FEG45EAEF7",
        Symbol("timestamp") => 1502962946216,
        Symbol("datetime") => "2017-08-17 12:42:48.000",
        Symbol("network") => "ETH",
        Symbol("address") => "0xEFE3487358AEF352345345",
        Symbol("addressTo") => "0xEFE3487358AEF352345123",
        Symbol("addressFrom") => "0xEFE3487358AEF352345456",
        Symbol("tag") => "smth",
        Symbol("tagTo") => "smth",
        Symbol("tagFrom") => "smth",
        Symbol("type") => "deposit",
        Symbol("amount") => parseNumber(exchange, "1.234"),
        Symbol("currency") => "USDT",
        Symbol("status") => "ok",
        Symbol("updated") => 1502962946233,
        Symbol("fee") => Dict{Symbol, Any}()
    );
    emptyAllowedFor = ["address", "addressTo", "addressFrom", "tag", "tagTo", "tagFrom"];
    assertStructure(testSharedMethods, exchange, skippedProperties, method, entry, format, emptyAllowedFor);
    assertTimestampAndDatetime(testSharedMethods, exchange, skippedProperties, method, entry, now);
    assertCurrencyCode(testSharedMethods, exchange, skippedProperties, method, entry, get(entry, Symbol("currency"), nothing), requestedCode);
    assertInArray(testSharedMethods, exchange, skippedProperties, method, entry, "status", ["ok", "pending", "failed", "rejected", "canceled"]);
    assertInArray(testSharedMethods, exchange, skippedProperties, method, entry, "type", ["deposit", "withdrawal"]);
    assertGreaterOrEqual(testSharedMethods, exchange, skippedProperties, method, entry, "amount", "0");
    assertFeeStructure(testSharedMethods, exchange, skippedProperties, method, entry, "fee");
    if functions.ccxtruthy(get(entry, Symbol("type"), nothing) == "deposit")
        assertType(testSharedMethods, exchange, skippedProperties, entry, "addressFrom", format);
    else
        assertType(testSharedMethods, exchange, skippedProperties, entry, "addressTo", format);
    end
end
