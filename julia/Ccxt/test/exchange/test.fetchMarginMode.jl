using Test
using Ccxt
function testFetchMarginMode(exchange, skippedProperties, symbol)

    method = "fetchMarginMode";
    marginMode = Base.fetch(fetchMarginMode(exchange, symbol));
    testMarginMode(exchange, skippedProperties, method, marginMode);
    return true
end
