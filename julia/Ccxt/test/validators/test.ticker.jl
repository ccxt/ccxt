using Test
using Ccxt
function testTicker(exchange, skippedProperties, method, entry, symbol)

    format = Dict{Symbol, Any}(
        Symbol("info") => Dict{Symbol, Any}(),
        Symbol("symbol") => "ETH/BTC",
        Symbol("timestamp") => 1502962946216,
        Symbol("datetime") => "2017-09-01T00:00:00",
        Symbol("high") => parseNumber(exchange, "1.234"),
        Symbol("low") => parseNumber(exchange, "1.234"),
        Symbol("bid") => parseNumber(exchange, "1.234"),
        Symbol("bidVolume") => parseNumber(exchange, "1.234"),
        Symbol("ask") => parseNumber(exchange, "1.234"),
        Symbol("askVolume") => parseNumber(exchange, "1.234"),
        Symbol("vwap") => parseNumber(exchange, "1.234"),
        Symbol("open") => parseNumber(exchange, "1.234"),
        Symbol("close") => parseNumber(exchange, "1.234"),
        Symbol("last") => parseNumber(exchange, "1.234"),
        Symbol("previousClose") => parseNumber(exchange, "1.234"),
        Symbol("change") => parseNumber(exchange, "1.234"),
        Symbol("percentage") => parseNumber(exchange, "1.234"),
        Symbol("average") => parseNumber(exchange, "1.234"),
        Symbol("baseVolume") => parseNumber(exchange, "1.234"),
        Symbol("quoteVolume") => parseNumber(exchange, "1.234")
    );
    emptyAllowedFor = ["timestamp", "datetime", "open", "high", "low", "close", "last", "baseVolume", "quoteVolume", "previousClose", "bidVolume", "askVolume", "vwap", "change", "percentage", "average"];
    if functions.ccxtruthy(!functions.ccxtruthy((occursin("BidsAsks", string(method)))))
                push!(emptyAllowedFor, "bid");
                push!(emptyAllowedFor, "ask");
    end
    assertStructure(testSharedMethods, exchange, skippedProperties, method, entry, format, emptyAllowedFor);
    assertTimestampAndDatetime(testSharedMethods, exchange, skippedProperties, method, entry);
    logText = logTemplate(testSharedMethods, exchange, method, entry);
    market = nothing;
    isUnrecognizedSymbol = false;
    isFetchTickerCalled = method == "fetchTicker";
    symbolForMarket = functions.ccxtruthy((symbol != nothing)) ? symbol : safeString(exchange, entry, "symbol");
    if functions.ccxtruthy(symbolForMarket != nothing)
        if functions.ccxtruthy(ccxt_in(symbolForMarket, get(exchange, Symbol("markets"), nothing)))
            market = Ccxt.market(exchange, symbolForMarket);
        else
            isUnrecognizedSymbol = true;
        end
    end
    if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in("checkInactiveMarkets", skippedProperties))))
        if functions.ccxtruthy(@functions.ccxt_and(market != nothing, get(market, Symbol("active"), nothing) == false))
                return 
        end
    end
    if functions.ccxtruthy(ccxt_in("skipNonActiveMarkets", skippedProperties))
        if functions.ccxtruthy(@functions.ccxt_or(market == nothing, !functions.ccxtruthy(get(market, Symbol("active"), nothing))))
                return 
        end
    end
    isStandardMarket = (@functions.ccxt_and(market != nothing, inArray(exchange, get(market, Symbol("type"), nothing), ["spot", "swap", "future", "option"])));
    valuesShouldBePositive = isStandardMarket;
    if functions.ccxtruthy(@functions.ccxt_and(valuesShouldBePositive, !functions.ccxtruthy((ccxt_in("positiveValues", skippedProperties)))))
        assertGreater(testSharedMethods, exchange, skippedProperties, method, entry, "open", "0");
        assertGreater(testSharedMethods, exchange, skippedProperties, method, entry, "high", "0");
        assertGreater(testSharedMethods, exchange, skippedProperties, method, entry, "low", "0");
        assertGreater(testSharedMethods, exchange, skippedProperties, method, entry, "close", "0");
        assertGreater(testSharedMethods, exchange, skippedProperties, method, entry, "ask", "0");
        assertGreater(testSharedMethods, exchange, skippedProperties, method, entry, "bid", "0");
        assertGreater(testSharedMethods, exchange, skippedProperties, method, entry, "average", "0");
        assertGreaterOrEqual(testSharedMethods, exchange, skippedProperties, method, entry, "vwap", "0");
    end
    assertGreaterOrEqual(testSharedMethods, exchange, skippedProperties, method, entry, "askVolume", "0");
    assertGreaterOrEqual(testSharedMethods, exchange, skippedProperties, method, entry, "bidVolume", "0");
    assertGreaterOrEqual(testSharedMethods, exchange, skippedProperties, method, entry, "baseVolume", "0");
    assertGreaterOrEqual(testSharedMethods, exchange, skippedProperties, method, entry, "quoteVolume", "0");
    lastString = safeString(exchange, entry, "last");
    closeString = safeString(exchange, entry, "close");
    @test functions.ccxtruthy(@functions.ccxt_or((@functions.ccxt_and((closeString == nothing), (lastString == nothing))), stringEq(lastString, closeString)))
    openPrice = safeString(exchange, entry, "open");
    baseVolume = omitZero(exchange, safeString(exchange, entry, "baseVolume"));
    quoteVolume = omitZero(exchange, safeString(exchange, entry, "quoteVolume"));
    high = omitZero(exchange, safeString(exchange, entry, "high"));
    low = omitZero(exchange, safeString(exchange, entry, "low"));
    open = omitZero(exchange, safeString(exchange, entry, "open"));
    close = omitZero(exchange, safeString(exchange, entry, "close"));
    if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in("compareQuoteVolumeBaseVolume", skippedProperties))))
        if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and((baseVolume != nothing), (quoteVolume != nothing)), (high != nothing)), (low != nothing)))
            baseLow = stringMul(baseVolume, low);
            baseHigh = stringMul(baseVolume, high);
            mPrecision = safeDict(exchange, market, "precision");
            amountPrecision = safeString(exchange, mPrecision, "amount");
            tolerance = "1.0001";
            if functions.ccxtruthy(amountPrecision != nothing)
                baseLow = stringMul(stringSub(baseVolume, amountPrecision), low);
                baseHigh = stringMul(stringAdd(baseVolume, amountPrecision), high);
            else
                baseLow = stringMul(stringDiv(baseVolume, tolerance), low);
                baseHigh = stringMul(stringMul(baseVolume, tolerance), high);
            end
            baseLow = stringDiv(baseLow, tolerance);
            baseHigh = stringMul(baseHigh, tolerance);
            @test functions.ccxtruthy(stringGe(quoteVolume, baseLow))
            @test functions.ccxtruthy(stringLe(quoteVolume, baseHigh))
        end
    end
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(high != nothing, low != nothing), !functions.ccxtruthy((ccxt_in("compareOHLC", skippedProperties)))))
        if functions.ccxtruthy(open != nothing)
            @test functions.ccxtruthy(stringGe(open, low))
            @test functions.ccxtruthy(stringLe(open, high))
        end
        if functions.ccxtruthy(close != nothing)
            @test functions.ccxtruthy(stringGe(close, low))
            @test functions.ccxtruthy(stringLe(close, high))
        end
    end
    vwap = safeString(exchange, entry, "vwap");
    if functions.ccxtruthy(vwap != nothing)
        @test functions.ccxtruthy(@functions.ccxt_or(!functions.ccxtruthy(valuesShouldBePositive), stringGe(vwap, "0")))
        if functions.ccxtruthy(baseVolume != nothing)
            @test quoteVolume != nothing
        end
        if functions.ccxtruthy(quoteVolume != nothing)
            @test baseVolume != nothing
        end
    end
    askString = safeString(exchange, entry, "ask");
    bidString = safeString(exchange, entry, "bid");
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((askString != nothing), (bidString != nothing)), !functions.ccxtruthy((ccxt_in("spread", skippedProperties)))))
        assertGreater(testSharedMethods, exchange, skippedProperties, method, entry, "ask", safeString(exchange, entry, "bid"));
    end
    allowedPercentageVariation = "0.01";
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and(isFetchTickerCalled, lastString != nothing), bidString != nothing), askString != nothing), !functions.ccxtruthy((ccxt_in("lastBetweenBidAsk", skippedProperties)))))
        medianPrice = stringDiv(stringAdd(bidString, askString), "2");
        medianLow = stringMul(medianPrice, stringSub("1", allowedPercentageVariation));
        medianHigh = stringMul(medianPrice, stringAdd("1", allowedPercentageVariation));
        @test functions.ccxtruthy(@functions.ccxt_and(stringGe(lastString, medianLow), stringLe(lastString, medianHigh)))
    end
    percentage = safeString(exchange, entry, "percentage");
    change = safeString(exchange, entry, "change");
    if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy((ccxt_in("maxIncrease", skippedProperties))), !functions.ccxtruthy(isUnrecognizedSymbol)))
        maxIncrease = "100";
        if functions.ccxtruthy(percentage != nothing)
            @test functions.ccxtruthy(stringGe(percentage, "-100"))
            @test functions.ccxtruthy(stringLe(percentage, stringMul("+100", maxIncrease)))
        end
        approxValue = safeStringN(exchange, entry, ["open", "close", "average", "bid", "ask", "vwap", "previousClose"]);
        if functions.ccxtruthy(change != nothing)
            @test functions.ccxtruthy(stringGe(change, stringNeg(approxValue)))
            @test functions.ccxtruthy(stringLe(change, stringMul(approxValue, maxIncrease)))
        end
    end
    if functions.ccxtruthy(lastString != nothing)
        if functions.ccxtruthy(percentage != nothing)
            @test functions.ccxtruthy(@functions.ccxt_and(openPrice != nothing, change != nothing))
        elseif functions.ccxtruthy(change != nothing)
            @test functions.ccxtruthy(@functions.ccxt_and(openPrice != nothing, percentage != nothing))
        end
    elseif functions.ccxtruthy(openPrice != nothing)
        if functions.ccxtruthy(percentage != nothing)
            @test functions.ccxtruthy(@functions.ccxt_and(lastString != nothing, change != nothing))
        elseif functions.ccxtruthy(change != nothing)
            @test functions.ccxtruthy(@functions.ccxt_and(lastString != nothing, percentage != nothing))
        end
    end
    assertSymbol(testSharedMethods, exchange, skippedProperties, method, entry, "symbol", symbol);
end
