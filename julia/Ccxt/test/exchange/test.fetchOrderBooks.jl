using Test
using Ccxt
function testFetchOrderBooks(exchange, skippedProperties)

    method = "fetchOrderBooks";
    symbols = get(exchange, Symbol("symbols"), nothing);
    @test symbols != nothing
    symbol = get(symbols, 1, nothing);
    orderBooks = Base.fetch(fetchOrderBooks(exchange, [symbol]));
    @test functions.ccxtruthy(isDictionary(exchange, orderBooks))
    orderBookKeys = objectKeys(orderBooks);
    @test functions.ccxtruthy(length(orderBookKeys))
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orderBookKeys)))
        symbolInner = get(orderBookKeys, i + 1, nothing);
        testOrderBook(exchange, skippedProperties, method, get(orderBooks, Symbol(symbolInner), nothing), symbolInner);
        i += 1
    end
    return true
end
