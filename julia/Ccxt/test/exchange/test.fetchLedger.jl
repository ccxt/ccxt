using Test
using Ccxt
function testFetchLedger(exchange, skippedProperties, code)

    method = "fetchLedger";
    items = Base.fetch(fetchLedger(exchange, code));
    assertNonEmtpyArray(testSharedMethods, exchange, skippedProperties, method, items, code);
    now = milliseconds(exchange);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(items)))
        testLedgerEntry(exchange, skippedProperties, method, get(items, i + 1, nothing), code, now);
        i += 1
    end
    assertTimestampOrder(testSharedMethods, exchange, method, code, items);
    return true
end
