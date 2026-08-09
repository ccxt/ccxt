using Test
using Ccxt
function testFetchTradingFee(exchange, skippedProperties, symbol)

    method = "fetchTradingFee";
    fee = Base.fetch(fetchTradingFee(exchange, symbol));
    @test functions.ccxtruthy(isDictionary(exchange, fee))
    testTradingFee(exchange, skippedProperties, method, symbol, fee);
    return true
end
