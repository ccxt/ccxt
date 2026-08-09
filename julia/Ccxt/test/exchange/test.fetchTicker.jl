using Test
using Ccxt
function testFetchTicker(exchange, skippedProperties, symbol)

    method = "fetchTicker";
    ticker = Base.fetch(fetchTicker(exchange, symbol));
    testTicker(exchange, skippedProperties, method, ticker, symbol);
    return true
end
