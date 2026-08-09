using Test
using Ccxt
function testLiquidation(exchange, skippedProperties, method, entry, symbol)

    format = Dict{Symbol, Any}(
        Symbol("info") => Dict{Symbol, Any}(),
        Symbol("symbol") => "ETH/BTC",
        Symbol("contracts") => parseNumber(exchange, "1.234"),
        Symbol("contractSize") => parseNumber(exchange, "1.234"),
        Symbol("price") => parseNumber(exchange, "1.234"),
        Symbol("baseValue") => parseNumber(exchange, "1.234"),
        Symbol("quoteValue") => parseNumber(exchange, "1.234"),
        Symbol("timestamp") => 1502962946216,
        Symbol("datetime") => "2017-09-01T00:00:00"
    );
    emptyAllowedFor = ["timestamp", "datetime", "quoteValue", "baseValue", "previousClose", "price", "contractSize", "contracts"];
    assertStructure(testSharedMethods, exchange, skippedProperties, method, entry, format, emptyAllowedFor);
    assertTimestampAndDatetime(testSharedMethods, exchange, skippedProperties, method, entry);
    logText = logTemplate(testSharedMethods, exchange, method, entry);
    assertGreater(testSharedMethods, exchange, skippedProperties, method, entry, "contracts", "0");
    assertGreater(testSharedMethods, exchange, skippedProperties, method, entry, "contractSize", "0");
    assertGreater(testSharedMethods, exchange, skippedProperties, method, entry, "price", "0");
    assertGreater(testSharedMethods, exchange, skippedProperties, method, entry, "baseValue", "0");
    assertGreater(testSharedMethods, exchange, skippedProperties, method, entry, "quoteValue", "0");
    contracts = safeString(exchange, entry, "contracts");
    contractSize = safeString(exchange, entry, "contractSize");
    price = safeString(exchange, entry, "price");
    baseValue = safeString(exchange, entry, "baseValue");
    if functions.ccxtruthy(@functions.ccxt_and(contracts, contractSize))
        @test functions.ccxtruthy(stringEq(baseValue, stringMul(contracts, contractSize)))
        if functions.ccxtruthy(price)
            @test functions.ccxtruthy(stringEq(baseValue, stringMul(stringMul(contracts, contractSize), price)))
        end
    end
    if functions.ccxtruthy(@functions.ccxt_or(method == "watchLiquidations", method == "fetchLiquidations"))
        assertSymbol(testSharedMethods, exchange, skippedProperties, method, entry, "symbol", symbol);
    end
end
