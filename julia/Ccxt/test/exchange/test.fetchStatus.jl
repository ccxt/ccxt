using Test
using Ccxt
function testFetchStatus(exchange, skippedProperties)

    method = "fetchStatus";
    status = Base.fetch(fetchStatus(exchange));
    testStatus(exchange, skippedProperties, method, status, milliseconds(exchange));
    return true
end
