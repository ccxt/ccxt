using Test
using Ccxt
function testFetchPositions(exchange, skippedProperties, symbol)

    method = "fetchPositions";
    now = milliseconds(exchange);
    positions = Base.fetch(fetchPositions(exchange));
    assertNonEmtpyArray(testSharedMethods, exchange, skippedProperties, method, positions, symbol);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(positions)))
        testPosition(exchange, skippedProperties, method, get(positions, i + 1, nothing), nothing, now);
        i += 1
    end
    positionsForSymbol = Base.fetch(fetchPositions(exchange, [symbol]));
    @test functions.ccxtruthy(functions.ccxt_isArray(positionsForSymbol))
    positionsForSymbolLength = length(positionsForSymbol);
    @test functions.ccxtruthy(functions.ccxt_le(positionsForSymbolLength, 4))
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(positionsForSymbol)))
        testPosition(exchange, skippedProperties, method, get(positionsForSymbol, i + 1, nothing), symbol, now);
        i += 1
    end
    return true
end
