using Test
using Ccxt
function testOrder(exchange, skippedProperties, method, entry, symbol, now)

    format = Dict{Symbol, Any}(
        Symbol("info") => Dict{Symbol, Any}(),
        Symbol("id") => "123",
        Symbol("clientOrderId") => "1234",
        Symbol("timestamp") => 1649373600000,
        Symbol("datetime") => "2022-04-07T23:20:00.000Z",
        Symbol("lastTradeTimestamp") => 1649373610000,
        Symbol("symbol") => "XYZ/USDT",
        Symbol("type") => "limit",
        Symbol("timeInForce") => "GTC",
        Symbol("postOnly") => true,
        Symbol("side") => "sell",
        Symbol("price") => parseNumber(exchange, "1.23456"),
        Symbol("stopPrice") => parseNumber(exchange, "1.1111"),
        Symbol("amount") => parseNumber(exchange, "1.23"),
        Symbol("cost") => parseNumber(exchange, "2.34"),
        Symbol("average") => parseNumber(exchange, "1.234"),
        Symbol("filled") => parseNumber(exchange, "1.23"),
        Symbol("remaining") => parseNumber(exchange, "0.123"),
        Symbol("status") => "ok",
        Symbol("fee") => Dict{Symbol, Any}(),
        Symbol("trades") => []
    );
    emptyAllowedFor = ["clientOrderId", "stopPrice", "trades", "timestamp", "datetime", "lastTradeTimestamp", "average", "type", "timeInForce", "postOnly", "side", "price", "amount", "cost", "filled", "remaining", "status", "fee"];
    assertStructure(testSharedMethods, exchange, skippedProperties, method, entry, format, emptyAllowedFor);
    assertTimestampAndDatetime(testSharedMethods, exchange, skippedProperties, method, entry, now);
    assertInArray(testSharedMethods, exchange, skippedProperties, method, entry, "timeInForce", ["GTC", "GTK", "IOC", "FOK", "PO"]);
    assertInArray(testSharedMethods, exchange, skippedProperties, method, entry, "status", ["open", "closed", "canceled"]);
    assertInArray(testSharedMethods, exchange, skippedProperties, method, entry, "side", ["buy", "sell"]);
    assertInArray(testSharedMethods, exchange, skippedProperties, method, entry, "postOnly", [true, false]);
    assertSymbol(testSharedMethods, exchange, skippedProperties, method, entry, "symbol", symbol);
    assertGreater(testSharedMethods, exchange, skippedProperties, method, entry, "price", "0");
    assertGreater(testSharedMethods, exchange, skippedProperties, method, entry, "stopPrice", "0");
    assertGreaterOrEqual(testSharedMethods, exchange, skippedProperties, method, entry, "cost", "0");
    assertGreater(testSharedMethods, exchange, skippedProperties, method, entry, "average", "0");
    assertGreaterOrEqual(testSharedMethods, exchange, skippedProperties, method, entry, "filled", "0");
    assertGreaterOrEqual(testSharedMethods, exchange, skippedProperties, method, entry, "remaining", "0");
    assertGreaterOrEqual(testSharedMethods, exchange, skippedProperties, method, entry, "amount", "0");
    assertGreaterOrEqual(testSharedMethods, exchange, skippedProperties, method, entry, "amount", safeString(exchange, entry, "remaining"));
    assertGreaterOrEqual(testSharedMethods, exchange, skippedProperties, method, entry, "amount", safeString(exchange, entry, "filled"));
    if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in("trades", skippedProperties))))
        skippedNew = deepExtend(exchange, skippedProperties, Dict{Symbol, Any}(
            Symbol("timestamp") => true,
            Symbol("datetime") => true,
            Symbol("side") => true
        ));
        if functions.ccxtruthy(get(entry, Symbol("trades"), nothing) != nothing)
            i = 0
            while functions.ccxtruthy(functions.ccxt_lt(i, length(get(entry, Symbol("trades"), nothing))))
                testTrade(exchange, skippedNew, method, get(get(entry, Symbol("trades"), nothing), i + 1, nothing), symbol, now);
                i += 1
            end

        end
    end
    assertFeeStructure(testSharedMethods, exchange, skippedProperties, method, entry, "fee");
end
