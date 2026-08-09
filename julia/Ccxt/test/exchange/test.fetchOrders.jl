using Test
using Ccxt
function testFetchOrders(exchange, skippedProperties, symbol)

    method = "fetchOrders";
    orders = Base.fetch(fetchOrders(exchange, symbol));
    @test functions.ccxtruthy(functions.ccxt_isArray(orders))
    assertNonEmtpyArray(testSharedMethods, exchange, skippedProperties, method, orders, symbol);
    now = milliseconds(exchange);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        testOrder(exchange, skippedProperties, method, get(orders, i + 1, nothing), symbol, now);
        i += 1
    end
    assertTimestampOrder(testSharedMethods, exchange, method, symbol, orders);
    return true
end
