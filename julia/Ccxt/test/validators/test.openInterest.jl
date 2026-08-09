using Test
using Ccxt
function testOpenInterest(exchange, skippedProperties, method, entry)

    format = Dict{Symbol, Any}(
        Symbol("symbol") => "BTC/USDT",
        Symbol("openInterestAmount") => parseNumber(exchange, "3544581864.598"),
        Symbol("openInterestValue") => parseNumber(exchange, "3544581864.598"),
        Symbol("timestamp") => 1649373600000,
        Symbol("datetime") => "2022-04-07T23:20:00.000Z",
        Symbol("info") => Dict{Symbol, Any}()
    );
    emptyAllowedFor = ["symbol", "timestamp", "openInterestAmount", "openInterestValue", "datetime"];
    assertStructure(testSharedMethods, exchange, skippedProperties, method, entry, format, emptyAllowedFor);
    assertSymbol(testSharedMethods, exchange, skippedProperties, method, entry, "symbol");
    assertTimestampAndDatetime(testSharedMethods, exchange, skippedProperties, method, entry);
    assertGreater(testSharedMethods, exchange, skippedProperties, method, entry, "openInterestAmount", "0");
    assertGreater(testSharedMethods, exchange, skippedProperties, method, entry, "openInterestValue", "0");
end
