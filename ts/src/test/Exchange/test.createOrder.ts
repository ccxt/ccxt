
import assert from 'assert';
import testSharedMethods from './base/test.sharedMethods.js';
import testOrder from './base/test.order.js';
import Precise from '../../base/Precise.js';

// ----------------------------------------------------------------------------

// just for debugging purposes
const debugCreateOrder = true;
function debugOutput (exchange, symbol, message) {
    if (debugCreateOrder) {
        console.log (' >>>>> testCreateOrder [' + exchange['id'] + ' : ' + symbol + '] ', message);
    }
}
// ----------------------------------------------------------------------------

async function testCreateOrder (exchange, skippedProperties, symbol) {
    const logPrefix = testSharedMethods.logTemplate (exchange, 'createOrder', [ symbol ]);
    // ensure it has cancel (any) method, otherwise we should refrain from automatic test.
    assert (exchange.has['cancelOrder'] || exchange.has['cancelOrders'] || exchange.has['cancelAllOrders'], logPrefix + ' does not have cancelOrder|cancelOrders|canelAllOrders method, which is needed to make tests for `createOrder` method. Skipping the test...');

    // pre-define some coefficients, which will be used down below
    const limitPriceSafetyMultiplierFromMedian = 1.045; // todo: in future, if ccxt would have "maximum limit price diapason" precisions unified, we can use those coefficients, but at this moment, differet exchanges have different coefficients. for example, unlike spot-market, binance's future market has 5% boundary for limit order prices, which means you can't place limit order higher than current price * 5% (i.e. for BTC/USDT market). So, at this moment, around 5% is acceptable range
    const market = exchange.market (symbol);
    const isSwapFuture = market['swap'] || market['future'];

    // we need fetchBalance method to test out orders correctly
    assert (exchange.has['fetchBalance'], logPrefix + ' does not have fetchBalance() method, which is needed to make tests for `createOrder` method. Skipping the test...');
    // ensure there is enough balance of 'quote' asset, because at first we need to 'buy' the base asset
    const balance = await exchange.fetchBalance ();
    const initialBaseBalance = balance[market['base']]['free'];
    const initialQuoteBalance = balance[market['quote']]['free'];
    // assert (initialQuoteBalance !== undefined, logPrefix + ' - testing account not have balance of' + market['quote'] + ' in fetchBalance() which is required to test');
    debugOutput (exchange, symbol, 'fetched balance for ' + symbol + ' : ' +  initialBaseBalance.toString () + ' ' + market['base'] + '/' + initialQuoteBalance  + ' ' + market['quote']);
    // get best bid & ask
    const [ bestBid, bestAsk ] = await testSharedMethods.tryFetchBestBidAsk (exchange, 'createOrder', symbol);

    // ****************************************************** //
    // **************** [Scenario 1 - START] **************** //
    // ****************************************************** //
    debugOutput (exchange, symbol, '### SCENARIO 1 ###');
    // - create a "limit order" which IS GUARANTEED not to have a fill (i.e. being far from the real price)
    await testCreateOrderCreateUnfillableOrder (exchange, market, logPrefix, skippedProperties, bestBid, bestAsk, limitPriceSafetyMultiplierFromMedian, 'buy', undefined);
    // if it's not spot market, then we should test sell orders too
    if (isSwapFuture) {
        await testCreateOrderCreateUnfillableOrder (exchange, market, logPrefix, skippedProperties, bestBid, bestAsk, limitPriceSafetyMultiplierFromMedian, 'sell', undefined);
    }
    debugOutput (exchange, symbol, '### SCENARIO 1 PASSED ###');
    // ****************************************************** //
    // **************** [Scenario 1 - END ] ***************** //
    // ****************************************************** //


    // ****************************************************** //
    // **************** [Scenario 2 - START] **************** //
    // ****************************************************** //
    debugOutput (exchange, symbol, '### SCENARIO 2 ###');
    // - create a "limit order" / "market order" which IS GUARANTEED to have a fill (full or partial)
    // - then sell the bought amount
    await testCreateOrderCreateFillableOrder (exchange, market, logPrefix, skippedProperties, bestBid, bestAsk, limitPriceSafetyMultiplierFromMedian, 'buy', undefined);
    // if it's not spot market, then we should test sell orders too
    if (isSwapFuture) {
        await testCreateOrderCreateFillableOrder (exchange, market, logPrefix, skippedProperties, bestBid, bestAsk, limitPriceSafetyMultiplierFromMedian, 'sell', undefined);
    }
    debugOutput (exchange, symbol, '### SCENARIO 2 PASSED ###');
    // ****************************************************** //
    // ***************** [Scenario 2 - END] ***************** //
    // ****************************************************** //


    // ****************************************************** //
    // **************** [Scenario 3 - START] **************** //
    // ****************************************************** //
    // above, we already tested 'limit' and 'market' orders. next, 'todo' is to create tests for other unified scenarios (spot, swap, trigger, positions, stoploss, takeprofit, etc)
    // ****************************************************** //
    // ***************** [Scenario 3 - END] ***************** //
    // ****************************************************** //
}

// ----------------------------------------------------------------------------

async function testCreateOrderCreateUnfillableOrder (exchange, market, logPrefix, skippedProperties, bestBid, bestAsk, limitPriceSafetyMultiplierFromMedian, buyOrSell, predefinedAmount = undefined) {
    try {
        const symbol = market['symbol'];
        const minimunPrices = exchange.safeValue (market['limits'], 'price', {});
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
            const orderAmount = getMinimumAmountForLimitPrice (exchange, market, limitBuyPrice_nonFillable, predefinedAmount);
            createdOrder = await testCreateOrderSubmitSafeOrder (exchange, symbol, 'limit', 'buy', orderAmount, limitBuyPrice_nonFillable, {}, skippedProperties);
        } else {
            const orderAmount = getMinimumAmountForLimitPrice (exchange, market, limitSellPrice_nonFillable, predefinedAmount);
            createdOrder = await testCreateOrderSubmitSafeOrder (exchange, symbol, 'limit', 'sell', orderAmount, limitSellPrice_nonFillable, {}, skippedProperties);
        }
        const fetchedOrder = await testSharedMethods.tryFetchOrder (exchange, symbol, createdOrder['id'], skippedProperties);
        // ensure that order is not filled
        testSharedMethods.assertOrderState (exchange, skippedProperties, 'createdOrder',  createdOrder, 'open', false);
        testSharedMethods.assertOrderState (exchange, skippedProperties, 'fetchedOrder', fetchedOrder, 'open', true);
        // ensure that order side matches
        testSharedMethods.assertInArray (exchange, skippedProperties, 'createdOrder', createdOrder, 'side', [ undefined, buyOrSell ]);
        testSharedMethods.assertInArray (exchange, skippedProperties, 'fetchedOrder', fetchedOrder, 'side', [ undefined, buyOrSell ]);
        // cancel the order
        await testCreateOrderCancelOrder (exchange, symbol, createdOrder['id']);
    } catch (e) {
        throw new Error (logPrefix + ' failed for Scenario 1: ' + e.toString ());
    }
}


async function testCreateOrderCreateFillableOrder (exchange, market, logPrefix, skippedProperties, bestBid, bestAsk, limitPriceSafetyMultiplierFromMedian, buyOrSellString, predefinedAmount = undefined) {
    try {
        const isSwapFuture = market['swap'] || market['future'];
        const isBuy = (buyOrSellString === 'buy');
        const entrySide = isBuy ? 'buy' : 'sell';
        const exitSide = isBuy ? 'sell' : 'buy';
        const entryorderPrice = isBuy ? bestAsk * limitPriceSafetyMultiplierFromMedian : bestBid / limitPriceSafetyMultiplierFromMedian;
        const exitorderPrice = isBuy ? bestBid / limitPriceSafetyMultiplierFromMedian : bestAsk * limitPriceSafetyMultiplierFromMedian;  // todo: this can also be used: (getMinimumCostForSymbol (exchange, market) / amountToClose) / limitPriceSafetyMultiplierFromMedian;
        //
        //
        const symbol = market['symbol'];
        const entryAmount = getMinimumAmountForLimitPrice (exchange, market, entryorderPrice);
        const entryorderFilled = await testCreateOrderSubmitSafeOrder (exchange, symbol, 'limit', entrySide, entryAmount, entryorderPrice, {}, skippedProperties);
        // just for case, cancel any possible unfilled amount (though it is not be expected because the order was fillable)
        await testCreateOrderTryCancelOrder (exchange, symbol, entryorderFilled, skippedProperties);
        // now, as order is closed/canceled, we can reliably fetch the order information
        const entryorderFetched = await testSharedMethods.tryFetchOrder (exchange, symbol, entryorderFilled['id'], skippedProperties);
        testCreateOrderVerifyFullExecution (exchange, market, logPrefix, skippedProperties, entryorderFilled, entryorderFetched, entrySide, entryAmount);
        //
        // ### close the traded position ###
        //
        const amountToClose = exchange.parseToNumeric (exchange.safeString (entryorderFetched, 'filled'));
        const params = {};
        // We should use 'reduceOnly' to ensure we don't open a margined position accidentally (i.e. on some exchanges it might lead to margin-sell, so let's be safe by using reduceOnly )
        if (isSwapFuture) {
            params['reduceOnly'] = true;
        }
        const exitorderFilled = await testCreateOrderSubmitSafeOrder (exchange, symbol, 'market', exitSide, amountToClose, (market['spot'] ? undefined : exitorderPrice), params, skippedProperties);
        const exitorderFetched = await testSharedMethods.tryFetchOrder (exchange, symbol, exitorderFilled['id'], skippedProperties);
        testCreateOrderVerifyFullExecution (exchange, market, logPrefix, skippedProperties, exitorderFilled, exitorderFetched, exitSide, amountToClose);
    } catch (e) {
        throw new Error ('failed for Scenario 2: ' + e.toString ());
    }
}


function testCreateOrderVerifyFullExecution (exchange, market, logPrefix, skippedProperties, createdOrder, fetchedOrder, requestedSide, requestedAmount) {
    // test filled amount
    const precisionAmount = exchange.safeString (market['precision'], 'amount');
    const entryorderAmountString = exchange.numberToString (requestedAmount);
    const filledString = exchange.safeString (fetchedOrder, 'filled');
    assert (filledString !== undefined, logPrefix + ' order should be filled, but it is not. ' + exchange.json (fetchedOrder));
    // filled amount should be whithin the expected range i.e. if you buy 100 DOGECOIN and amount-precision is 1,
    // and also considering possible roundings in implementation, then filled amount should be between 99 and 101
    const maxExpectedFilledAmount = Precise.stringAdd (entryorderAmountString, precisionAmount);
    const minExpectedFilledAmount = Precise.stringSub (entryorderAmountString, precisionAmount);
    assert (Precise.stringLe (filledString, maxExpectedFilledAmount), logPrefix + ' filled amount is more than expected, possibly some implementation issue. ' + exchange.json (fetchedOrder));
    assert (Precise.stringGe (filledString, minExpectedFilledAmount), logPrefix + ' filled amount is less than expected, possibly some implementation issue. ' + exchange.json (fetchedOrder));
    // order state should be "closed"
    testSharedMethods.assertOrderState (exchange, skippedProperties, 'createdOrder',  createdOrder, 'closed', false);
    testSharedMethods.assertOrderState (exchange, skippedProperties, 'fetchedOrder', fetchedOrder, 'closed', true);
    // ensure that order side matches
    testSharedMethods.assertInArray (exchange, skippedProperties, 'createdOrder', createdOrder, 'side', [ undefined, requestedSide ]);
    testSharedMethods.assertInArray (exchange, skippedProperties, 'fetchedOrder', fetchedOrder, 'side', [ undefined, requestedSide ]);
}





// ----------------------------------------------------------------------------

async function testCreateOrderCancelOrder (exchange, symbol, orderId = undefined) {
    // cancel the order (one of the below methods is guaranteed to be existent, as this was checked in the start of this test)
    let usedMethod = '';
    let cancelResult = undefined;
    if (exchange.has['cancelOrder'] && orderId !== undefined) {
        usedMethod = 'cancelOrder';
        cancelResult = await exchange.cancelOrder (orderId, symbol);
    } else if (exchange.has['cancelAllOrders']) {
        usedMethod = 'cancelAllOrders';
        cancelResult = await exchange.cancelAllOrders (symbol);
    } else if (exchange.has['cancelOrders']) {
        usedMethod = 'cancelOrders';
        if (orderId === undefined) {
            cancelResult = await exchange.cancelOrders ([], symbol);
        } else {
            cancelResult = await exchange.cancelOrders ([ orderId ], symbol);
        }
    }
    debugOutput (exchange, symbol, 'canceled order using ' + usedMethod);
    // todo: assert canceled & closed status
    // testSharedMethods.assertOrderState (exchange, skippedProperties, 'createdOrder',  createdOrder, 'open', false);
    // testSharedMethods.assertOrderState (exchange, skippedProperties, 'fetchedOrder', fetchedOrder, 'open', true);
}

// ----------------------------------------------------------------------------


// ----------------------------------------------------------------------------

async function testCreateOrderSubmitSafeOrder (exchange, symbol, orderType, side, amount, price = undefined, params = {}, skippedProperties = {}) {
    debugOutput (exchange, symbol, 'Executing createOrder ' + orderType + ' ' + side + ' ' + amount + ' ' + price + ' ' + exchange.json (params));
    const order = await exchange.createOrder (symbol, orderType, side, amount, price, params);
    try {
        // test through regular order object test
        testOrder (exchange, skippedProperties, 'createOrder', order, symbol, Date.now ());
    } catch (e) {
        // if test failed for some reason, then we stop any futher testing and throw exception. However, before it, we should try to cancel that order, if possible.
        if (orderType !== 'market') // market order is not cancelable
        {
            await testCreateOrderTryCancelOrder (exchange, symbol, order, skippedProperties);
        }
        // now, we can throw the initial error
        throw e;
    }
    return order;
}

function getMinimumAmountForSymbol (exchange, market) {
    // todo: In future, intentionally add a tiny increment to the minimum amount/cost, to test & ensure that it will not cause precision issues (thus we ensure that implementation handles them)
    const amountValues = exchange.safeValue (market['limits'], 'amount', {});
    const amountMin = exchange.safeNumber (amountValues, 'min');
    assert (amountMin !== undefined,  exchange.id + ' ' +  market['symbol'] + ' can not determine minimum amount for order');
    return amountMin;
}

function getMinimumCostForSymbol (exchange, market) {
    const costValues = exchange.safeValue (market['limits'], 'cost', {});
    const costMin = exchange.safeNumber (costValues, 'min');
    assert (costMin !== undefined, exchange.id + ' ' +  market['symbol'] + ' can not determine minimum cost for order');
    return costMin;
}

function getMinimumAmountForLimitPrice (exchange, market, price, predefinedAmount = undefined) {
    const minimumAmount = getMinimumAmountForSymbol (exchange, market);
    const minimumCost = getMinimumCostForSymbol (exchange, market);
    // as prices volatile constantly, "minimum limits" also change constantly, so we'd better add some tiny diapason to be sure that order will successfully accepted
    let finalAmount = minimumAmount;
    if (minimumCost !== undefined) {
        // minimum amount is not enough for order (because it's almost permanent minimum amount defined once by exchange), instead it's important that order met minimum cost(notional) requirement
        if (finalAmount * price < minimumCost) {
            finalAmount = minimumCost / price;
        }
    }
    if (predefinedAmount !== undefined) {
        finalAmount = Math.max (finalAmount, predefinedAmount);
    }
    // because it's possible that calculated value might get truncated down in "createOrder" (i.e. 0.129 -> 0.12), we should ensure that final amount * price would bypass minimum cost requirements, by adding the "minimum precision"
    let amountPrecision = exchange.safeNumber (market['precision'], 'amount');
    const isTickSizePrecision = exchange.precisionMode === 4;
    // if precision is not defined, then calculate it from amount value
    if (amountPrecision === undefined) {
        amountPrecision = 0.000000000000001; // todo: revise this for better way in future
    } else {
        // if not TICK-SIZE, then convert into value
        if (!isTickSizePrecision) {
            amountPrecision = 1 / Math.pow (10, amountPrecision);
        }
    }
    // the current value might be too long (i.e. 0.12345678) and inside 'createOrder' it's being truncated down. It might cause our automatic cost calcuation accidentaly to be less than "market->limits->cost>min", so, before it, we should round it up to nearest precision, thus we ensure the overal cost will be above minimum requirements
    finalAmount = finalAmount + amountPrecision;
    finalAmount = finalAmount * 1.10; // add around 10% for further notional safety
    finalAmount = parseFloat (exchange.decimalToPrecision (finalAmount, 2, market['precision']['amount'], exchange.precisionMode)); // 2 stands for ROUND_UP constant, 0 stands for truncate
    return finalAmount;
}

async function testCreateOrderTryCancelOrder (exchange, symbol, order, skippedProperties) {
    const logPrefix = testSharedMethods.logTemplate (exchange, 'createOrder', [ symbol ]);
    // fetch order for maximum accuracy
    const orderFetched = await testSharedMethods.tryFetchOrder (exchange, symbol, order['id'], skippedProperties);
    // check their status
    const needsCancel = exchange.inArray (orderFetched['status'], [ 'open', 'pending', undefined ]);
    // if it was not reported as closed/filled, then try to cancel it
    if (needsCancel) {
        debugOutput (exchange, symbol, 'trying to cancel the remaining amount of partially filled order...');
        try {
            await testCreateOrderCancelOrder (exchange, symbol, order['id']);
        } catch (e) {
            // we don't throw exception here, because order might have been closed/filled already, before 'cancelOrder' call reaches server, so it is tolerable
            debugOutput (exchange, symbol, ' order ' + order['id'] + ' a moment ago order was reported as pending, but could not be cancelled at this moment. Exception message: ' + e.toString () + ' ' +  exchange.json (order));
        }
    } else {
        debugOutput (exchange, symbol, 'order is already closed/filled, no need to cancel it');
    }
}

export default testCreateOrder;
