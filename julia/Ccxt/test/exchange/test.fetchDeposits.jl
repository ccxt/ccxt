using Test
using Ccxt
function testFetchDeposits(exchange, skippedProperties, code)

    method = "fetchDeposits";
    transactions = Base.fetch(fetchDeposits(exchange, code));
    assertNonEmtpyArray(testSharedMethods, exchange, skippedProperties, method, transactions, code);
    now = milliseconds(exchange);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(transactions)))
        testDepositWithdrawal(exchange, skippedProperties, method, get(transactions, i + 1, nothing), code, now);
        i += 1
    end
    assertTimestampOrder(testSharedMethods, exchange, method, code, transactions);
    return true
end
