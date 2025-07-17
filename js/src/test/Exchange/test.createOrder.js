import assert from 'assert';
import testSharedMethods from './base/test.sharedMethods.js';
import testOrder from './base/test.order.js';
import Precise from '../../base/Precise.js';
// ----------------------------------------------------------------------------
function tcoDebug(exchange, symbol, message) {
    // just for debugging purposes
    const debugCreateOrder = true;
    if (debugCreateOrder) {
        // for c# fix, extra step to convert them to string
        console.log(' >>>>> testCreateOrder [', (exchange['id']).toString(), ' : ', symbol, '] ', message);
    }
    return true;
}
// ----------------------------------------------------------------------------
async function testCreateOrder(exchange, skippedProperties, symbol) {
    const logPrefix = testSharedMethods.logTemplate(exchange, 'createOrder', [symbol]);
    assert(exchange.has['cancelOrder'] || exchange.has['cancelOrders'] || exchange.has['cancelAllOrders'], logPrefix + ' does not have cancelOrder|cancelOrders|canelAllOrders method, which is needed to make tests for `createOrder` method. Skipping the test...');
    // pre-define some coefficients, which will be used down below
    const limitPriceSafetyMultiplierFromMedian = 1.045; // todo: when this https://github.com/ccxt/ccxt/issues/22442 is implemented, we'll remove hardcoded value. atm 5% is enough
    const market = exchange.market(symbol);
    const isSwapFuture = market['swap'] || market['future'];
    assert(exchange.has['fetchBalance'], logPrefix + ' does not have fetchBalance() method, which is needed to make tests for `createOrder` method. Skipping the test...');
    const balance = await exchange.fetchBalance();
    const initialBaseBalance = balance[market['base']]['free'];
    const initialQuoteBalance = balance[market['quote']]['free'];
    assert(initialQuoteBalance !== undefined, logPrefix + ' - testing account not have balance of' + market['quote'] + ' in fetchBalance() which is required to test');
    tcoDebug(exchange, symbol, 'fetched balance for ' + symbol + ' : ' + initialBaseBalance.toString() + ' ' + market['base'] + '/' + initialQuoteBalance + ' ' + market['quote']);
    const [bestBid, bestAsk] = await testSharedMethods.fetchBestBidAsk(exchange, 'createOrder', symbol);
    // **************** [Scenario 1 - START] **************** //
    tcoDebug(exchange, symbol, '### SCENARIO 1 ###');
    // create a "limit order" which IS GUARANTEED not to have a fill (i.e. being far from the real price)
    await tcoCreateUnfillableOrder(exchange, market, logPrefix, skippedProperties, bestBid, bestAsk, limitPriceSafetyMultiplierFromMedian, 'buy', undefined);
    if (isSwapFuture) {
        // for swap markets, we test sell orders too
        await tcoCreateUnfillableOrder(exchange, market, logPrefix, skippedProperties, bestBid, bestAsk, limitPriceSafetyMultiplierFromMedian, 'sell', undefined);
    }
    tcoDebug(exchange, symbol, '### SCENARIO 1 PASSED ###');
    // **************** [Scenario 2 - START] **************** //
    tcoDebug(exchange, symbol, '### SCENARIO 2 ###');
    // create an order which IS GUARANTEED to have a fill (full or partial)
    await tcoCreateFillableOrder(exchange, market, logPrefix, skippedProperties, bestBid, bestAsk, limitPriceSafetyMultiplierFromMedian, 'buy', undefined);
    if (isSwapFuture) {
        // for swap markets, we test sell orders too
        await tcoCreateFillableOrder(exchange, market, logPrefix, skippedProperties, bestBid, bestAsk, limitPriceSafetyMultiplierFromMedian, 'sell', undefined);
    }
    tcoDebug(exchange, symbol, '### SCENARIO 2 PASSED ###');
    // **************** [Scenario 3 - START] **************** //
    return true;
    // above, we already tested 'limit' and 'market' orders. next, 'todo' is to create tests for other unified scenarios (spot, swap, trigger, positions, stoploss, takeprofit, etc)
    //
    //
    // re
    //
}
// ----------------------------------------------------------------------------
async function tcoCreateUnfillableOrder(exchange, market, logPrefix, skippedProperties, bestBid, bestAsk, limitPriceSafetyMultiplierFromMedian, buyOrSell, predefinedAmount = undefined) {
    try {
        const symbol = market['symbol'];
        const minimunPrices = exchange.safeDict(market['limits'], 'price', {});
        const minimumPrice = minimunPrices['min'];
        const maximumPrice = minimunPrices['max'];
        // below we set limit price, where the order will not be completed.
        // We do not use the extreme "limits" values for that market, because, even though min purchase amount for BTC/USDT can be 0.01 BTC, it means with 10$ you can buy 1000 BTC, which leads to unrealistic outcome. So, we just use around 5%-10% far price from the current price.
        let limitBuyPrice_nonFillable = bestBid / limitPriceSafetyMultiplierFromMedian;
        if (minimumPrice !== undefined && limitBuyPrice_nonFillable < minimumPrice) {
            limitBuyPrice_nonFillable = minimumPrice;
        }
        let limitSellPrice_nonFillable = bestAsk * limitPriceSafetyMultiplierFromMedian;
        if (maximumPrice !== undefined && limitSellPrice_nonFillable > maximumPrice) {
            limitSellPrice_nonFillable = maximumPrice;
        }
        let createdOrder = undefined;
        if (buyOrSell === 'buy') {
            const orderAmount = tcoGetMinimumAmountForLimitPrice(exchange, market, limitBuyPrice_nonFillable, predefinedAmount);
            createdOrder = await tcoCreateOrderSafe(exchange, symbol, 'limit', 'buy', orderAmount, limitBuyPrice_nonFillable, {}, skippedProperties);
        }
        else {
            const orderAmount = tcoGetMinimumAmountForLimitPrice(exchange, market, limitSellPrice_nonFillable, predefinedAmount);
            createdOrder = await tcoCreateOrderSafe(exchange, symbol, 'limit', 'sell', orderAmount, limitSellPrice_nonFillable, {}, skippedProperties);
        }
        const fetchedOrder = await testSharedMethods.fetchOrder(exchange, symbol, createdOrder['id'], skippedProperties);
        // test fetched order object
        if (fetchedOrder !== undefined) {
            testOrder(exchange, skippedProperties, 'createOrder', fetchedOrder, symbol, exchange.milliseconds());
        }
        // ensure that order is not filled
        testSharedMethods.assertOrderState(exchange, skippedProperties, 'createdOrder', createdOrder, 'open', false);
        testSharedMethods.assertOrderState(exchange, skippedProperties, 'fetchedOrder', fetchedOrder, 'open', true);
        // ensure that order side matches
        testSharedMethods.assertInArray(exchange, skippedProperties, 'createdOrder', createdOrder, 'side', [undefined, buyOrSell]);
        testSharedMethods.assertInArray(exchange, skippedProperties, 'fetchedOrder', fetchedOrder, 'side', [undefined, buyOrSell]);
        await tcoCancelOrder(exchange, symbol, createdOrder['id']);
    }
    catch (e) {
        throw new Error(logPrefix + ' failed for Scenario 1: ' + e.toString());
    }
    return true;
}
async function tcoCreateFillableOrder(exchange, market, logPrefix, skippedProperties, bestBid, bestAsk, limitPriceSafetyMultiplierFromMedian, buyOrSellString, predefinedAmount = undefined) {
    try {
        const isSwapFuture = market['swap'] || market['future'];
        const isBuy = (buyOrSellString === 'buy');
        const entrySide = isBuy ? 'buy' : 'sell';
        const exitSide = isBuy ? 'sell' : 'buy';
        const entryorderPrice = isBuy ? bestAsk * limitPriceSafetyMultiplierFromMedian : bestBid / limitPriceSafetyMultiplierFromMedian;
        const exitorderPrice = isBuy ? bestBid / limitPriceSafetyMultiplierFromMedian : bestAsk * limitPriceSafetyMultiplierFromMedian; // todo revise: (tcoMininumCost (exchange, market) / amountToClose) / limitPriceSafetyMultiplierFromMedian;
        //
        //
        const symbol = market['symbol'];
        const entryAmount = tcoGetMinimumAmountForLimitPrice(exchange, market, entryorderPrice);
        const entryorderFilled = await tcoCreateOrderSafe(exchange, symbol, 'limit', entrySide, entryAmount, entryorderPrice, {}, skippedProperties);
        // just for case, cancel any possible unfilled amount (though it is not be expected because the order was fillable)
        await tcoTryCancelOrder(exchange, symbol, entryorderFilled, skippedProperties);
        // now, as order is closed/canceled, we can reliably fetch the order information
        const entryorderFetched = await testSharedMethods.fetchOrder(exchange, symbol, entryorderFilled['id'], skippedProperties);
        tcoAssertFilledOrder(exchange, market, logPrefix, skippedProperties, entryorderFilled, entryorderFetched, entrySide, entryAmount);
        //
        // ### close the traded position ###
        //
        const amountToClose = exchange.parseToNumeric(exchange.safeString(entryorderFetched, 'filled'));
        const params = {};
        // as we want to close position, we should use 'reduceOnly' to ensure we don't open a margined position accidentally, because some exchanges might have automatically enabled margin-mode (on spot) or hedge-mode (on contracts)
        if (isSwapFuture) {
            params['reduceOnly'] = true;
        }
        const exitorderFilled = await tcoCreateOrderSafe(exchange, symbol, 'market', exitSide, amountToClose, (market['spot'] ? undefined : exitorderPrice), params, skippedProperties);
        const exitorderFetched = await testSharedMethods.fetchOrder(exchange, symbol, exitorderFilled['id'], skippedProperties);
        tcoAssertFilledOrder(exchange, market, logPrefix, skippedProperties, exitorderFilled, exitorderFetched, exitSide, amountToClose);
    }
    catch (e) {
        throw new Error('failed for Scenario 2: ' + e.toString());
    }
    return true;
}
function tcoAssertFilledOrder(exchange, market, logPrefix, skippedProperties, createdOrder, fetchedOrder, requestedSide, requestedAmount) {
    // test filled amount
    const precisionAmount = exchange.safeString(market['precision'], 'amount');
    const entryorderAmountString = exchange.numberToString(requestedAmount);
    const filledString = exchange.safeString(fetchedOrder, 'filled');
    assert(filledString !== undefined, logPrefix + ' order should be filled, but it is not. ' + exchange.json(fetchedOrder));
    // filled amount should be whithin the expected range i.e. if you buy 100 DOGECOIN and amount-precision is 1,
    // and also considering possible roundings in implementation, then filled amount should be between 99 and 101
    const maxExpectedFilledAmount = Precise.stringAdd(entryorderAmountString, precisionAmount);
    const minExpectedFilledAmount = Precise.stringSub(entryorderAmountString, precisionAmount);
    assert(Precise.stringLe(filledString, maxExpectedFilledAmount), logPrefix + ' filled amount is more than expected, possibly some implementation issue. ' + exchange.json(fetchedOrder));
    assert(Precise.stringGe(filledString, minExpectedFilledAmount), logPrefix + ' filled amount is less than expected, possibly some implementation issue. ' + exchange.json(fetchedOrder));
    // order state should be "closed"
    testSharedMethods.assertOrderState(exchange, skippedProperties, 'createdOrder', createdOrder, 'closed', false);
    testSharedMethods.assertOrderState(exchange, skippedProperties, 'fetchedOrder', fetchedOrder, 'closed', true);
    // ensure that order side matches
    testSharedMethods.assertInArray(exchange, skippedProperties, 'createdOrder', createdOrder, 'side', [undefined, requestedSide]);
    testSharedMethods.assertInArray(exchange, skippedProperties, 'fetchedOrder', fetchedOrder, 'side', [undefined, requestedSide]);
    return true;
}
// ----------------------------------------------------------------------------
async function tcoCancelOrder(exchange, symbol, orderId = undefined) {
    const logPrefix = testSharedMethods.logTemplate(exchange, 'createOrder', [symbol]);
    let usedMethod = '';
    let cancelResult = undefined;
    if (exchange.has['cancelOrder'] && orderId !== undefined) {
        usedMethod = 'cancelOrder';
        cancelResult = await exchange.cancelOrder(orderId, symbol);
    }
    else if (exchange.has['cancelAllOrders']) {
        usedMethod = 'cancelAllOrders';
        cancelResult = await exchange.cancelAllOrders(symbol);
    }
    else if (exchange.has['cancelOrders']) {
        // todo: uncomment after cancelOrders unification: https://github.com/ccxt/ccxt/pull/22199
        // usedMethod = 'cancelOrders';
        // if (orderId === undefined) {
        //     cancelResult = await exchange.cancelOrders ([], symbol);
        // } else {
        //     cancelResult = await exchange.cancelOrders ([ orderId ], symbol);
        // }
        throw new Error(logPrefix + ' cancelOrders method is not unified yet, coming soon...');
    }
    tcoDebug(exchange, symbol, 'canceled order using ' + usedMethod + ':' + cancelResult['id']);
    // todo:
    // testSharedMethods.assertOrderState (exchange, skippedProperties, 'cancelOrder', cancelResult, 'canceled', false);
    // testSharedMethods.assertOrderState (exchange, skippedProperties, 'cancelOrder', cancelResult, 'closed', true);
    return true;
}
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
async function tcoCreateOrderSafe(exchange, symbol, orderType, side, amount, price = undefined, params = {}, skippedProperties = {}) {
    tcoDebug(exchange, symbol, 'Executing createOrder ' + orderType + ' ' + side + ' ' + amount + ' ' + price + ' ' + exchange.json(params));
    const order = await exchange.createOrder(symbol, orderType, side, amount, price, params);
    try {
        testOrder(exchange, skippedProperties, 'createOrder', order, symbol, Date.now());
    }
    catch (e) {
        if (orderType !== 'market') {
            // if it was limit order, try to cancel it before exiting the script
            await tcoTryCancelOrder(exchange, symbol, order, skippedProperties);
        }
        throw e;
    }
    return order;
}
function tcoMininumAmount(exchange, market) {
    const amountValues = exchange.safeDict(market['limits'], 'amount', {});
    const amountMin = exchange.safeNumber(amountValues, 'min');
    assert(amountMin !== undefined, exchange.id + ' ' + market['symbol'] + ' can not determine minimum amount for order');
    return amountMin;
}
function tcoMininumCost(exchange, market) {
    const costValues = exchange.safeDict(market['limits'], 'cost', {});
    const costMin = exchange.safeNumber(costValues, 'min');
    assert(costMin !== undefined, exchange.id + ' ' + market['symbol'] + ' can not determine minimum cost for order');
    return costMin;
}
function tcoGetMinimumAmountForLimitPrice(exchange, market, price, predefinedAmount = undefined) {
    // this method calculates the minimum realistic order amount:
    // at first it checks the "minimum hardcap limit" (i.e. 7 DOGE), however, if exchange also has "minimum cost" limits,
    // then we need to calculate the amount using cost, because of price is volatile, today's 7 DOGE cost could be 1$
    // but "minimum cost" requirement could be 5$ (which translates to 35 DOGE amount)
    const minimumAmount = tcoMininumAmount(exchange, market);
    const minimumCost = tcoMininumCost(exchange, market);
    let finalAmount = minimumAmount;
    if (minimumCost !== undefined) {
        if (finalAmount * price < minimumCost) {
            finalAmount = minimumCost / price;
        }
    }
    if (predefinedAmount !== undefined) {
        finalAmount = Math.max(finalAmount, predefinedAmount);
    }
    // because it's possible that calculated value might get truncated down in "createOrder" (i.e. 0.129 -> 0.12), we should ensure that final amount * price would bypass minimum cost requirements, by adding the "minimum precision"
    let amountPrecision = exchange.safeNumber(market['precision'], 'amount');
    const isTickSizePrecision = exchange.precisionMode === 4;
    if (amountPrecision === undefined) {
        amountPrecision = 0.000000000000001; // todo: revise this for better way in future
    }
    else {
        // todo: remove after TICK_SIZE unification
        if (!isTickSizePrecision) {
            amountPrecision = 1 / Math.pow(10, amountPrecision); // this converts DECIMAL_PRECISION into TICK_SIZE
        }
    }
    finalAmount = finalAmount + amountPrecision;
    finalAmount = finalAmount * 1.10; // add around 10% to ensure "cost" is enough
    finalAmount = parseFloat(exchange.decimalToPrecision(finalAmount, 2, market['precision']['amount'], exchange.precisionMode)); // 2 stands for ROUND_UP constant, 0 stands for TRUNCATE
    return finalAmount;
}
async function tcoTryCancelOrder(exchange, symbol, order, skippedProperties) {
    const orderFetched = await testSharedMethods.fetchOrder(exchange, symbol, order['id'], skippedProperties);
    const needsCancel = exchange.inArray(orderFetched['status'], ['open', 'pending', undefined]);
    // if it was not reported as closed/filled, then try to cancel it
    if (needsCancel) {
        tcoDebug(exchange, symbol, 'trying to cancel the remaining amount of partially filled order...');
        try {
            await tcoCancelOrder(exchange, symbol, order['id']);
        }
        catch (e) {
            // order might have been closed/filled already, before 'cancelOrder' call reaches server, so it is tolerable, we don't throw exception
            tcoDebug(exchange, symbol, ' a moment ago order was reported as pending, but could not be cancelled at this moment. Exception message: ' + e.toString());
        }
    }
    else {
        tcoDebug(exchange, symbol, 'order is already closed/filled, no need to cancel it');
    }
    return true;
}
export default testCreateOrder;
