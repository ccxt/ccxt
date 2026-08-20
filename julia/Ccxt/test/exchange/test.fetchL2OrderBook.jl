using Test
using Ccxt
function testFetchL2OrderBook(exchange, skippedProperties, symbol)

    method = "fetchL2OrderBook";
    orderBook = Base.fetch(fetchL2OrderBook(exchange, symbol));
    testOrderBook(exchange, skippedProperties, method, orderBook, symbol);
    return true
end
