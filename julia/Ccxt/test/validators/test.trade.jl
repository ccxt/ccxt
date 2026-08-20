using Test
using Ccxt
function testTrade(exchange, skippedProperties, method, entry, symbol, now)

    format = Dict{Symbol, Any}(
        Symbol("info") => Dict{Symbol, Any}(),
        Symbol("id") => "12345-67890:09876/54321",
        Symbol("timestamp") => 1502962946216,
        Symbol("datetime") => "2017-08-17 12:42:48.000",
        Symbol("symbol") => "ETH/BTC",
        Symbol("order") => "12345-67890:09876/54321",
        Symbol("side") => "buy",
        Symbol("takerOrMaker") => "taker",
        Symbol("price") => parseNumber(exchange, "0.06917684"),
        Symbol("amount") => parseNumber(exchange, "1.5"),
        Symbol("cost") => parseNumber(exchange, "0.10376526"),
        Symbol("fees") => [],
        Symbol("fee") => Dict{Symbol, Any}(
            Symbol("cost") => parseNumber(exchange, "0.001"),
            Symbol("currency") => "USDT"
        )
    );
    emptyAllowedFor = ["fees", "fee", "symbol", "order", "id", "takerOrMaker"];
    assertStructure(testSharedMethods, exchange, skippedProperties, method, entry, format, emptyAllowedFor);
    assertTimestampAndDatetime(testSharedMethods, exchange, skippedProperties, method, entry, now);
    assertSymbol(testSharedMethods, exchange, skippedProperties, method, entry, "symbol", symbol);
    assertInArray(testSharedMethods, exchange, skippedProperties, method, entry, "side", ["buy", "sell"]);
    assertInArray(testSharedMethods, exchange, skippedProperties, method, entry, "takerOrMaker", ["taker", "maker"]);
    assertFeeStructure(testSharedMethods, exchange, skippedProperties, method, entry, "fee");
    if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in("fees", skippedProperties))))
        if functions.ccxtruthy(get(entry, Symbol("fees"), nothing) != nothing)
            i = 0
            while functions.ccxtruthy(functions.ccxt_lt(i, length(get(entry, Symbol("fees"), nothing))))
                assertFeeStructure(testSharedMethods, exchange, skippedProperties, method, get(entry, Symbol("fees"), nothing), i);
                i += 1
            end

        end
    end
end
