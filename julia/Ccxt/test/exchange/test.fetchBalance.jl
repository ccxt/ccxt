using Test
using Ccxt
function testFetchBalance(exchange, skippedProperties)

    method = "fetchBalance";
    response = Base.fetch(fetchBalance(exchange));
    testBalance(exchange, skippedProperties, method, response);
    return true
end
