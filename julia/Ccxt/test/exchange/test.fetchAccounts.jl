using Test
using Ccxt
function testFetchAccounts(exchange, skippedProperties)

    method = "fetchAccounts";
    accounts = Base.fetch(fetchAccounts(exchange));
    assertNonEmtpyArray(testSharedMethods, exchange, skippedProperties, method, accounts);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(accounts)))
        testAccount(exchange, skippedProperties, method, get(accounts, i + 1, nothing));
        i += 1
    end
    return true
end
