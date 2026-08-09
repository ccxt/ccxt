using Test
using Ccxt
function testOrderBook(exchange, skippedProperties, method, orderbook, symbol)

    format = Dict{Symbol, Any}(
        Symbol("symbol") => "ETH/BTC",
        Symbol("asks") => [[parseNumber(exchange, "1.24"), parseNumber(exchange, "0.453")], [parseNumber(exchange, "1.25"), parseNumber(exchange, "0.157")]],
        Symbol("bids") => [[parseNumber(exchange, "1.23"), parseNumber(exchange, "0.123")], [parseNumber(exchange, "1.22"), parseNumber(exchange, "0.543")]],
        Symbol("timestamp") => 1504224000000,
        Symbol("datetime") => "2017-09-01T00:00:00",
        Symbol("nonce") => 134234234
    );
    emptyAllowedFor = ["nonce"];
    orderbook = deepExtend(exchange, Dict{Symbol, Any}(), orderbook);
    assertStructure(testSharedMethods, exchange, skippedProperties, method, orderbook, format, emptyAllowedFor);
    assertTimestampAndDatetime(testSharedMethods, exchange, skippedProperties, method, orderbook);
    assertSymbol(testSharedMethods, exchange, skippedProperties, method, orderbook, "symbol", symbol);
    logText = logTemplate(testSharedMethods, exchange, method, orderbook);
    bids = get(orderbook, Symbol("bids"), nothing);
    bidsLength = length(bids);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, bidsLength))
        currentBidString = safeString(exchange, get(bids, i + 1, nothing), 0);
        if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in("compareToNextItem", skippedProperties))))
            nextI = i + 1;
            if functions.ccxtruthy(functions.ccxt_gt(bidsLength, nextI))
                nextBidString = safeString(exchange, get(bids, nextI + 1, nothing), 0);
                @test functions.ccxtruthy(stringGt(currentBidString, nextBidString))
            end
        end
        if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in("compareToZero", skippedProperties))))
            assertGreater(testSharedMethods, exchange, skippedProperties, method, get(bids, i + 1, nothing), 0, "0");
            assertGreater(testSharedMethods, exchange, skippedProperties, method, get(bids, i + 1, nothing), 1, "0");
        end
        i += 1
    end
    asks = get(orderbook, Symbol("asks"), nothing);
    asksLength = length(asks);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, asksLength))
        currentAskString = safeString(exchange, get(asks, i + 1, nothing), 0);
        if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in("compareToNextItem", skippedProperties))))
            nextI = i + 1;
            if functions.ccxtruthy(functions.ccxt_gt(asksLength, nextI))
                nextAskString = safeString(exchange, get(asks, nextI + 1, nothing), 0);
                @test functions.ccxtruthy(stringLt(currentAskString, nextAskString))
            end
        end
        if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in("compareToZero", skippedProperties))))
            assertGreater(testSharedMethods, exchange, skippedProperties, method, get(asks, i + 1, nothing), 0, "0");
            assertGreater(testSharedMethods, exchange, skippedProperties, method, get(asks, i + 1, nothing), 1, "0");
        end
        i += 1
    end
    if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in("spread", skippedProperties))))
        if functions.ccxtruthy(@functions.ccxt_and(bidsLength, asksLength))
            firstBid = safeString(exchange, get(bids, 1, nothing), 0);
            firstAsk = safeString(exchange, get(asks, 1, nothing), 0);
            @test functions.ccxtruthy(stringLt(firstBid, firstAsk))
        end
    end
end
