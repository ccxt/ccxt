using Test
using Ccxt
function testOHLCV(exchange, skippedProperties, method, entry, symbol, now)

    format = [1638230400000, parseNumber(exchange, "0.123"), parseNumber(exchange, "0.125"), parseNumber(exchange, "0.121"), parseNumber(exchange, "0.122"), parseNumber(exchange, "123.456")];
    emptyNotAllowedFor = [0, 1, 2, 3, 4, 5];
    assertStructure(testSharedMethods, exchange, skippedProperties, method, entry, format, emptyNotAllowedFor);
    assertTimestampAndDatetime(testSharedMethods, exchange, skippedProperties, method, entry, now, 0);
    logText = logTemplate(testSharedMethods, exchange, method, entry);
    @test functions.ccxtruthy(functions.ccxt_ge(length(entry), 6))
    if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in("roundTimestamp", skippedProperties))))
        assertRoundMinuteTimestamp(testSharedMethods, exchange, skippedProperties, method, entry, 0);
    end
    high = safeString(exchange, entry, 2);
    low = safeString(exchange, entry, 3);
    if functions.ccxtruthy(ccxt_in("compareOHLCV", skippedProperties))
            return 
    end
    assertLessOrEqual(testSharedMethods, exchange, skippedProperties, method, entry, "1", high);
    assertGreaterOrEqual(testSharedMethods, exchange, skippedProperties, method, entry, "1", low);
    assertLessOrEqual(testSharedMethods, exchange, skippedProperties, method, entry, "4", high);
    assertGreaterOrEqual(testSharedMethods, exchange, skippedProperties, method, entry, "4", low);
    @test functions.ccxtruthy(@functions.ccxt_or((symbol == nothing), (isa(symbol, AbstractString))))
end
