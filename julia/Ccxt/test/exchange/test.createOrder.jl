using Test
using Ccxt
function tcoDebug(exchange, symbol, message)

    debugCreateOrder = true;
    if functions.ccxtruthy(debugCreateOrder)
        msg = string(" >>>>> testCreateOrder [", (get(exchange, Symbol("id"), nothing)), " : ", symbol, "] ", message);
        println(msg);
    end
    return true
end


function testCreateOrder(exchange, skippedProperties, symbol)

    logPrefix = logTemplate(testSharedMethods, exchange, "createOrder", [symbol]);
    @test functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(get(get(exchange, Symbol("has"), nothing), Symbol("cancelOrder"), nothing), get(get(exchange, Symbol("has"), nothing), Symbol("cancelOrders"), nothing)), get(get(exchange, Symbol("has"), nothing), Symbol("cancelAllOrders"), nothing)))
    limitPriceSafetyMultiplierFromMedian = 1.045;
    market = Ccxt.market(exchange, symbol);
    isSwapFuture = @functions.ccxt_or(get(market, Symbol("swap"), nothing), get(market, Symbol("future"), nothing));
    @test functions.ccxtruthy(get(get(exchange, Symbol("has"), nothing), Symbol("fetchBalance"), nothing))
    balance = Base.fetch(fetchBalance(exchange));
    initialBaseBalance = get(get(balance, Symbol(get(market, Symbol("base"), nothing)), nothing), Symbol("free"), nothing);
    initialQuoteBalance = get(get(balance, Symbol(get(market, Symbol("quote"), nothing)), nothing), Symbol("free"), nothing);
    @test initialQuoteBalance != nothing
    tcoDebug(exchange, symbol, string("fetched balance for ", symbol, " : ", initialBaseBalance, " ", get(market, Symbol("base"), nothing), "/", initialQuoteBalance, " ", get(market, Symbol("quote"), nothing)));
    (bestBid, bestAsk) = (Base.fetch(fetchBestBidAsk(testSharedMethods, exchange, "createOrder", symbol)));
    tcoDebug(exchange, symbol, "### SCENARIO 1 ###");
    Base.fetch(tcoCreateUnfillableOrder(exchange, market, logPrefix, skippedProperties, bestBid, bestAsk, limitPriceSafetyMultiplierFromMedian, "buy"));
    if functions.ccxtruthy(isSwapFuture)
        Base.fetch(tcoCreateUnfillableOrder(exchange, market, logPrefix, skippedProperties, bestBid, bestAsk, limitPriceSafetyMultiplierFromMedian, "sell"));
    end
    tcoDebug(exchange, symbol, "### SCENARIO 1 PASSED ###");
    tcoDebug(exchange, symbol, "### SCENARIO 2 ###");
    Base.fetch(tcoCreateFillableOrder(exchange, market, logPrefix, skippedProperties, bestBid, bestAsk, limitPriceSafetyMultiplierFromMedian, "buy"));
    if functions.ccxtruthy(isSwapFuture)
        Base.fetch(tcoCreateFillableOrder(exchange, market, logPrefix, skippedProperties, bestBid, bestAsk, limitPriceSafetyMultiplierFromMedian, "sell"));
    end
    tcoDebug(exchange, symbol, "### SCENARIO 2 PASSED ###");
    return true
end


function tcoCreateUnfillableOrder(exchange, market, logPrefix, skippedProperties, bestBid, bestAsk, limitPriceSafetyMultiplierFromMedian, buyOrSell, predefinedAmount=nothing)

    try
        symbol = get(market, Symbol("symbol"), nothing);
        minimunPrices = safeDict(exchange, get(market, Symbol("limits"), nothing), "price", Dict{Symbol, Any}());
        minimumPrice = get(minimunPrices, Symbol("min"), nothing);
        maximumPrice = get(minimunPrices, Symbol("max"), nothing);
        limitBuyPrice_nonFillable = bestBid / limitPriceSafetyMultiplierFromMedian;
        if functions.ccxtruthy(@functions.ccxt_and(minimumPrice != nothing, functions.ccxt_lt(limitBuyPrice_nonFillable, minimumPrice)))
            limitBuyPrice_nonFillable = minimumPrice;
        end
        limitSellPrice_nonFillable = bestAsk * limitPriceSafetyMultiplierFromMedian;
        if functions.ccxtruthy(@functions.ccxt_and(maximumPrice != nothing, functions.ccxt_gt(limitSellPrice_nonFillable, maximumPrice)))
            limitSellPrice_nonFillable = maximumPrice;
        end
        if functions.ccxtruthy(buyOrSell == "buy")
            orderAmount = tcoGetMinimumAmountForLimitPrice(exchange, market, limitBuyPrice_nonFillable, predefinedAmount);
            createdOrder = Base.fetch(tcoCreateOrderSafe(exchange, symbol, "limit", "buy", orderAmount, limitBuyPrice_nonFillable, Dict{Symbol, Any}(), skippedProperties));
        else
            orderAmount = tcoGetMinimumAmountForLimitPrice(exchange, market, limitSellPrice_nonFillable, predefinedAmount);
            createdOrder = Base.fetch(tcoCreateOrderSafe(exchange, symbol, "limit", "sell", orderAmount, limitSellPrice_nonFillable, Dict{Symbol, Any}(), skippedProperties));
        end
        fetchedOrder = Base.fetch(fetchOrder(testSharedMethods, exchange, symbol, get(createdOrder, Symbol("id"), nothing), skippedProperties));
        if functions.ccxtruthy(fetchedOrder != nothing)
            testOrder(exchange, skippedProperties, "createOrder", fetchedOrder, symbol, milliseconds(exchange));
        end
        assertOrderState(testSharedMethods, exchange, skippedProperties, "createdOrder", createdOrder, "open", false);
        assertOrderState(testSharedMethods, exchange, skippedProperties, "fetchedOrder", fetchedOrder, "open", true);
        assertInArray(testSharedMethods, exchange, skippedProperties, "createdOrder", createdOrder, "side", [nothing, buyOrSell]);
        assertInArray(testSharedMethods, exchange, skippedProperties, "fetchedOrder", fetchedOrder, "side", [nothing, buyOrSell]);
        Base.fetch(tcoCancelOrder(exchange, symbol, get(createdOrder, Symbol("id"), nothing)));
    catch e
        throw(Error(string(logPrefix, " failed for Scenario 1: ", e)));

    end
    return true
end


function tcoCreateFillableOrder(exchange, market, logPrefix, skippedProperties, bestBid, bestAsk, limitPriceSafetyMultiplierFromMedian, buyOrSellString, predefinedAmount=nothing)

    try
        isSwapFuture = @functions.ccxt_or(get(market, Symbol("swap"), nothing), get(market, Symbol("future"), nothing));
        isBuy = (buyOrSellString == "buy");
        entrySide = functions.ccxtruthy(isBuy) ? "buy" : "sell";
        exitSide = functions.ccxtruthy(isBuy) ? "sell" : "buy";
        entryorderPrice = functions.ccxtruthy(isBuy) ? bestAsk * limitPriceSafetyMultiplierFromMedian : bestBid / limitPriceSafetyMultiplierFromMedian;
        exitorderPrice = functions.ccxtruthy(isBuy) ? bestBid / limitPriceSafetyMultiplierFromMedian : bestAsk * limitPriceSafetyMultiplierFromMedian;
        symbol = get(market, Symbol("symbol"), nothing);
        entryAmount = tcoGetMinimumAmountForLimitPrice(exchange, market, entryorderPrice);
        entryorderFilled = Base.fetch(tcoCreateOrderSafe(exchange, symbol, "limit", entrySide, entryAmount, entryorderPrice, Dict{Symbol, Any}(), skippedProperties));
        Base.fetch(tcoTryCancelOrder(exchange, symbol, entryorderFilled, skippedProperties));
        entryorderFetched = Base.fetch(fetchOrder(testSharedMethods, exchange, symbol, get(entryorderFilled, Symbol("id"), nothing), skippedProperties));
        tcoAssertFilledOrder(exchange, market, logPrefix, skippedProperties, entryorderFilled, entryorderFetched, entrySide, entryAmount);
        amountToClose = parseToNumeric(exchange, safeString(exchange, entryorderFetched, "filled"));
        params = Dict{Symbol, Any}();
        if functions.ccxtruthy(isSwapFuture)
            params[Symbol("reduceOnly")] = true;
        end
        exitorderFilled = Base.fetch(tcoCreateOrderSafe(exchange, symbol, "market", exitSide, amountToClose, (functions.ccxtruthy(get(market, Symbol("spot"), nothing)) ? nothing : exitorderPrice), params, skippedProperties));
        exitorderFetched = Base.fetch(fetchOrder(testSharedMethods, exchange, symbol, get(exitorderFilled, Symbol("id"), nothing), skippedProperties));
        tcoAssertFilledOrder(exchange, market, logPrefix, skippedProperties, exitorderFilled, exitorderFetched, exitSide, amountToClose);
    catch e
        throw(Error(string("failed for Scenario 2: ", e)));

    end
    return true
end


function tcoAssertFilledOrder(exchange, market, logPrefix, skippedProperties, createdOrder, fetchedOrder, requestedSide, requestedAmount)

    precisionAmount = safeString(exchange, get(market, Symbol("precision"), nothing), "amount");
    entryorderAmountString = numberToString(exchange, requestedAmount);
    filledString = safeString(exchange, fetchedOrder, "filled");
    @test filledString != nothing
    maxExpectedFilledAmount = stringAdd(entryorderAmountString, precisionAmount);
    minExpectedFilledAmount = stringSub(entryorderAmountString, precisionAmount);
    @test functions.ccxtruthy(stringLe(filledString, maxExpectedFilledAmount))
    @test functions.ccxtruthy(stringGe(filledString, minExpectedFilledAmount))
    assertOrderState(testSharedMethods, exchange, skippedProperties, "createdOrder", createdOrder, "closed", false);
    assertOrderState(testSharedMethods, exchange, skippedProperties, "fetchedOrder", fetchedOrder, "closed", true);
    assertInArray(testSharedMethods, exchange, skippedProperties, "createdOrder", createdOrder, "side", [nothing, requestedSide]);
    assertInArray(testSharedMethods, exchange, skippedProperties, "fetchedOrder", fetchedOrder, "side", [nothing, requestedSide]);
    return true
end


function tcoCancelOrder(exchange, symbol, orderId=nothing)

    logPrefix = logTemplate(testSharedMethods, exchange, "createOrder", [symbol]);
    usedMethod = "";
    cancelResult = nothing;
    if functions.ccxtruthy(@functions.ccxt_and(get(get(exchange, Symbol("has"), nothing), Symbol("cancelOrder"), nothing), orderId != nothing))
        usedMethod = "cancelOrder";
        cancelResult = Base.fetch(cancelOrder(exchange, orderId, symbol));
    elseif functions.ccxtruthy(get(get(exchange, Symbol("has"), nothing), Symbol("cancelAllOrders"), nothing))
        usedMethod = "cancelAllOrders";
        cancelResult = Base.fetch(cancelAllOrders(exchange, symbol));
    else
        if functions.ccxtruthy(get(get(exchange, Symbol("has"), nothing), Symbol("cancelOrders"), nothing))
            throw(Error(string(logPrefix, " cancelOrders method is not unified yet, coming soon...")));
        end

    end
    tcoDebug(exchange, symbol, string("canceled order using ", usedMethod, ":", get(cancelResult, Symbol("id"), nothing)));
    return true
end


function tcoCreateOrderSafe(exchange, symbol, orderType, side, amount, price=nothing, params=Dict(), skippedProperties=Dict())

    tcoDebug(exchange, symbol, string("Executing createOrder ", orderType, " ", side, " ", amount, " ", price, " ", json(exchange, params)));
    order = Base.fetch(createOrder(exchange, symbol, orderType, side, amount, price, params));
    try
        testOrder(exchange, skippedProperties, "createOrder", order, symbol, round(Int, time() * 1000));
    catch e
        if functions.ccxtruthy(orderType != "market")
            Base.fetch(tcoTryCancelOrder(exchange, symbol, order, skippedProperties));
        end
        throw(e);

    end
    return order
end


function tcoMininumAmount(exchange, market)

    amountValues = safeDict(exchange, get(market, Symbol("limits"), nothing), "amount", Dict{Symbol, Any}());
    amountMin = safeNumber(exchange, amountValues, "min");
    @test amountMin != nothing
    return amountMin
end


function tcoMininumCost(exchange, market)

    costValues = safeDict(exchange, get(market, Symbol("limits"), nothing), "cost", Dict{Symbol, Any}());
    costMin = safeNumber(exchange, costValues, "min");
    @test costMin != nothing
    return costMin
end


function tcoGetMinimumAmountForLimitPrice(exchange, market, price, predefinedAmount=nothing)

    minimumAmount = tcoMininumAmount(exchange, market);
    minimumCost = tcoMininumCost(exchange, market);
    finalAmount = minimumAmount;
    if functions.ccxtruthy(minimumCost != nothing)
        if functions.ccxtruthy(functions.ccxt_lt(finalAmount * price, minimumCost))
            finalAmount = minimumCost / price;
        end
    end
    if functions.ccxtruthy(predefinedAmount != nothing)
        finalAmount = max(finalAmount, predefinedAmount);
    end
    amountPrecision = safeNumber(exchange, get(market, Symbol("precision"), nothing), "amount");
    isTickSizePrecision = get(exchange, Symbol("precisionMode"), nothing) == 4;
    if functions.ccxtruthy(amountPrecision == nothing)
        amountPrecision = 1e-15;
    else
        if functions.ccxtruthy(!functions.ccxtruthy(isTickSizePrecision))
            amountPrecision = 1 / pow(10, amountPrecision);
        end
    end
    finalAmount = finalAmount + amountPrecision;
    finalAmount = finalAmount * 1.1;
    finalAmount = ccxt_toNumber(decimalToPrecision(exchange, finalAmount, 2, get(get(market, Symbol("precision"), nothing), Symbol("amount"), nothing), get(exchange, Symbol("precisionMode"), nothing)));
    return finalAmount
end


function tcoTryCancelOrder(exchange, symbol, order, skippedProperties)

    orderFetched = Base.fetch(fetchOrder(testSharedMethods, exchange, symbol, get(order, Symbol("id"), nothing), skippedProperties));
    needsCancel = inArray(exchange, get(orderFetched, Symbol("status"), nothing), ["open", "pending", nothing]);
    if functions.ccxtruthy(needsCancel)
        tcoDebug(exchange, symbol, "trying to cancel the remaining amount of partially filled order...");
        try
            Base.fetch(tcoCancelOrder(exchange, symbol, get(order, Symbol("id"), nothing)));
        catch e
            tcoDebug(exchange, symbol, string(" a moment ago order was reported as pending, but could not be cancelled at this moment. Exception message: ", e));

        end
    else
        tcoDebug(exchange, symbol, "order is already closed/filled, no need to cancel it");
    end
    return true
end
