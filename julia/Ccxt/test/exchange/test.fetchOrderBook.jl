using Test
using Ccxt
function testFetchOrderBook(exchange, skippedProperties, symbol)

    method = "fetchOrderBook";
    orderbook = Base.fetch(fetchOrderBook(exchange, symbol));
    testOrderBook(exchange, skippedProperties, method, orderbook, symbol);
    return true
end
