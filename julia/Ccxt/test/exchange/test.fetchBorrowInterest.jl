using Test
using Ccxt
function testFetchBorrowInterest(exchange, skippedProperties, code, symbol)

    method = "fetchBorrowInterest";
    borrowInterest = Base.fetch(fetchBorrowInterest(exchange, code, symbol));
    assertNonEmtpyArray(testSharedMethods, exchange, skippedProperties, method, borrowInterest, code);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(borrowInterest)))
        testBorrowInterest(exchange, skippedProperties, method, get(borrowInterest, i + 1, nothing), code, symbol);
        i += 1
    end
    return true
end
