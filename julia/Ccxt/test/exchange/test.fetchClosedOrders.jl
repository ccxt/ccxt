using Test
using Ccxt
function testFetchClosedOrders(exchange, skippedProperties, symbol)

    method = "fetchClosedOrders";
    orders = Base.fetch(fetchClosedOrders(exchange, symbol));
    assertNonEmtpyArray(testSharedMethods, exchange, skippedProperties, method, orders, symbol);
    now = milliseconds(exchange);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        order = get(orders, i + 1, nothing);
        testOrder(exchange, skippedProperties, method, order, symbol, now);
        assertInArray(testSharedMethods, exchange, skippedProperties, method, order, "status", ["closed", "canceled"]);
        i += 1
    end
    assertTimestampOrder(testSharedMethods, exchange, method, symbol, orders);
    return true
end
