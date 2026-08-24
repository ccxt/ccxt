using Test
using Ccxt
function testFetchTransfers(exchange, skippedProperties, code)

    method = "fetchTransfers";
    transfers = Base.fetch(fetchTransfers(exchange, code));
    assertNonEmtpyArray(testSharedMethods, exchange, skippedProperties, method, transfers, code);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(transfers)))
        testTransfer(exchange, skippedProperties, method, get(transfers, i + 1, nothing), code);
        i += 1
    end
    assertTimestampOrder(testSharedMethods, exchange, method, code, transfers);
    return true
end
