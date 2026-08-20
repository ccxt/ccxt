using Test
using Ccxt
function testFetchLedgerEntry(exchange, skippedProperties, code)

    method = "fetchLedgerEntry";
    items = Base.fetch(fetchLedger(exchange, code));
    len = length(items);
    assertNonEmtpyArray(testSharedMethods, exchange, skippedProperties, method, items, code);
    if functions.ccxtruthy(functions.ccxt_gt(len, 0))
        firstItem = get(items, 1, nothing);
        id = get(firstItem, Symbol("id"), nothing);
        if functions.ccxtruthy(id != nothing)
            item = Base.fetch(fetchLedgerEntry(exchange, id));
            now = milliseconds(exchange);
            testLedgerEntry(exchange, skippedProperties, method, item, code, now);
        end
    end
    return true
end
