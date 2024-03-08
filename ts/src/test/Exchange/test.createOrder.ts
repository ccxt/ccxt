
import assert from 'assert';
import testSharedMethods from './base/test.sharedMethods.js';
import testOrder from './base/test.order.js';
import Precise from '../../base/Precise.js';

// ----------------------------------------------------------------------------

// before this will become transpiled, temporarily use some variables & verbose logs for successfull JS debugging
const testName = 'testCreateOrder';
const methodName = 'createOrder';
const warningPrefix = ' !!! ' + testName;
const debugPrefix = ' >>> ' + testName;
const isVerbose = true;
function verboseOutput (exchange, symbol, ...args) {
    if (isVerbose) {
        console.log (debugPrefix + ' [' + exchange['id'] + ' : ' + symbol + '] ', ...args);
    }
}
// ----------------------------------------------------------------------------

async function testCreateOrder (exchange, skippedProperties, symbol) {
    const logPrefix = testSharedMethods.logTemplate (exchange, 'createOrder', [ symbol ]);
    if (!exchange.has[methodName]) {
        console.log (logPrefix, 'does not have method ', methodName, ' yet, skipping test...');
        return;
    }
    // ensure it has cancel (any) method, otherwise we should refrain from automatic test.
    assert (exchange.has['cancelOrder'] || exchange.has['cancelOrders'] || exchange.has['cancelAllOrders'], logPrefix + ' does not have cancelOrder|cancelOrders|canelAllOrders method, which is needed to make tests for `createOrder` method. Skipping the test...');

    // pre-define some coefficients, which will be used down below
    const limitPriceSafetyMultiplierFromMedian = 1.045; // todo: in future, if ccxt would have "maximum limit price diapason" precisions unified, we can use those coefficients, but at this moment, differet exchanges have different coefficients. for example, unlike spot-market, binance's future market has 5% boundary for limit order prices, which means you can't place limit order higher than current price * 5% (i.e. for BTC/USDT market). So, at this moment, around 5% is acceptable range
    const market = exchange.market (symbol);

    // we need fetchBalance method to test out orders correctly
    assert (exchange.has['fetchBalance'], logPrefix + ' does not have fetchBalance() method, which is needed to make tests for `createOrder` method. Skipping the test...');
    // ensure there is enough balance of 'quote' asset, because at first we need to 'buy' the base asset
    const balance = await exchange.fetchBalance ();
    const initialBaseBalance = balance[market['base']]['free'];
    const initialQuoteBalance = balance[market['quote']]['free'];
    assert (initialQuoteBalance !== undefined, logPrefix + ' - testing account not have balance of' + market['quote'] + ' in fetchBalance() which is required to test ' + methodName);
    verboseOutput (exchange, symbol, 'fetched balance for', symbol, ':', initialBaseBalance, market['base'], '/', initialQuoteBalance, market['quote']);
    // get best bid & ask
    const [ bestBid, bestAsk ] = await testSharedMethods.tryFetchBestBidAsk (exchange, 'createOrder', symbol);

    // ****************************************************** //
    // **************** [Scenario 1 - START] **************** //
    // ****************************************************** //
    // - create a "limit order" which IS GUARANTEED not to have a fill (i.e. being far from the real price)
    await testCreateOrderCreateUnfillableOrder (exchange, market, logPrefix, skippedProperties, bestBid, bestAsk, limitPriceSafetyMultiplierFromMedian, 'buy', undefined);
    // ****************************************************** //
    // **************** [Scenario 1 - END ] ***************** //
    // ****************************************************** //


    // ****************************************************** //
    // **************** [Scenario 2 - START] **************** //
    // ****************************************************** //
    // - create a "limit order" / "market order" which IS GUARANTEED to have a fill (full or partial)
    // - then sell the bought amount
    await testCreateOrderCreateFillableOrder (exchange, market, logPrefix, skippedProperties, bestBid, bestAsk, limitPriceSafetyMultiplierFromMedian, 'buy', undefined);
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
        let nonFillableOrder = undefined;
        if (buyOrSell === 'buy') {
            const orderAmount = getMinimumAmountForLimitPrice (exchange, market, limitBuyPrice_nonFillable, predefinedAmount);
            nonFillableOrder = await testCreateOrderSubmitSafeOrder (exchange, symbol, 'limit', 'buy', orderAmount, limitBuyPrice_nonFillable, {}, skippedProperties);
        } else {
            const orderAmount = getMinimumAmountForLimitPrice (exchange, market, limitSellPrice_nonFillable, predefinedAmount);
            nonFillableOrder = await testCreateOrderSubmitSafeOrder (exchange, symbol, 'limit', 'sell', orderAmount, limitSellPrice_nonFillable, {}, skippedProperties);
        }
        const nonFillableOrder_fetched = await testSharedMethods.tryFetchOrder (exchange, symbol, nonFillableOrder['id'], skippedProperties);
        // ensure that order is not filled
        const isClosed = testSharedMethods.confirmOrderState (exchange, nonFillableOrder, 'closed');
        const isClosedFetched = testSharedMethods.confirmOrderState (exchange, nonFillableOrder_fetched, 'closed');
        assert (!isClosed, logPrefix + ' order should not be filled, but it is. ' + JSON.stringify (nonFillableOrder));
        assert (!isClosedFetched, logPrefix + ' order should not be filled, but it is. ' + JSON.stringify (nonFillableOrder_fetched));
        // cancel the order
        await testCreateOrderCancelOrder (exchange, symbol, nonFillableOrder['id']);
        verboseOutput (exchange, symbol, 'SCENARIO 1 PASSED !!!');
    } catch (e) {
        throw new Error (logPrefix + ' ' + methodName + ' failed for Scenario 1: ' + e.toString ());
    }
}


async function testCreateOrderCreateFillableOrder (exchange, market, logPrefix, skippedProperties, bestBid, bestAsk, limitPriceSafetyMultiplierFromMedian, buyOrSell, predefinedAmount = undefined) {
    try {
        const symbol = market['symbol'];
        const limitBuyPrice_fillable = bestAsk * limitPriceSafetyMultiplierFromMedian;
        const finalAmountToBuy = getMinimumAmountForLimitPrice (exchange, market, limitBuyPrice_fillable);
        const buyOrder_fillable = await testCreateOrderSubmitSafeOrder (exchange, symbol, 'limit', 'buy', finalAmountToBuy, limitBuyPrice_fillable, {}, skippedProperties);
        // try to cancel remnant (if any) of order
        await testCreateOrderTryCancelOrder (exchange, symbol, buyOrder_fillable, skippedProperties);
        // now, as order is closed/canceled, we can reliably fetch the order information
        const buyOrder_filled_fetched = await testSharedMethods.tryFetchOrder (exchange, symbol, buyOrder_fillable['id'], skippedProperties);
        // we need to find out the amount of base asset that was bought
        assert (buyOrder_filled_fetched['filled'] !== undefined, logPrefix + ' ' +  exchange.id + ' ' + symbol + ' order should be filled, but it is not. ' + exchange.json (buyOrder_filled_fetched));
        const amountToSell = buyOrder_filled_fetched['filled'];
        // We should use 'reduceOnly' to ensure we don't open a margin-ed position accidentally (i.e. on some exchanges it might lead to margin-sell, so let's be safe by using reduceOnly )
        const params = {
            'reduceOnly': true,
        };
        const minimumCostForBuy = getMinimumCostForSymbol (exchange, market);
        const priceForMarketSellOrder = (minimumCostForBuy / amountToSell) * limitPriceSafetyMultiplierFromMedian;
        const sellOrder = await testCreateOrderSubmitSafeOrder (exchange, symbol, 'market', 'sell', amountToSell, priceForMarketSellOrder, params, skippedProperties);
        const sellOrder_fetched = await testSharedMethods.tryFetchOrder (exchange, symbol, sellOrder['id'], skippedProperties);
        // try to test that order was fully filled
        const isClosedFetched = testSharedMethods.confirmOrderState (exchange, sellOrder_fetched, 'closed');
        const isOpenFetched = testSharedMethods.confirmOrderState (exchange, sellOrder_fetched, 'open');
        assert (isClosedFetched || isOpenFetched === undefined, warningPrefix + ' ' +  exchange.id + ' ' + symbol + ' order should be filled, but it is not. ' + exchange.json (sellOrder_fetched));
        verboseOutput (exchange, symbol, 'SCENARIO 2 PASSED !!!');
    } catch (e) {
        throw new Error ('failed for Scenario 2: ' + e.toString ());
    }
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
    verboseOutput (exchange, symbol, 'canceled order using', usedMethod, ' : ', exchange.json (cancelResult));
}

// ----------------------------------------------------------------------------


// ----------------------------------------------------------------------------

async function testCreateOrderSubmitSafeOrder (exchange, symbol, orderType, side, amount, price = undefined, params = {}, skippedProperties = {}) {
    verboseOutput (exchange, symbol, 'Executing createOrder', orderType, side, amount, price, params);
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
    // if precision is not defined, then calculate it from amount value
    if (amountPrecision === undefined) {
        let digitsOfPrecision = undefined;
        // if it is not TICK-SIZE, then convert it to amount
        if (exchange.precisionMode !== 2) {
            digitsOfPrecision = parseInt (exchange.precisionFromString (exchange.numberToString (finalAmount)));
        } else {
            digitsOfPrecision = getTickSizeFromString (exchange.numberToString (finalAmount));
        }
        amountPrecision = 1 / Math.pow (10, digitsOfPrecision);
    }
    // the current value might be too long (i.e. 0.12345678) and inside 'createOrder' it's being truncated down. It might cause our automatic cost calcuation accidentaly to be less than "market->limits->cost>min", so, before it, we should round it up to nearest precision, thus we ensure the overal cost will be above minimum requirements
    finalAmount = parseFloat (exchange.decimalToPrecision (finalAmount, 2, market['precision']['amount'], exchange.precisionMode)); // 2 stands for ROUND_UP constant, 0 stands for truncate
    finalAmount = finalAmount + amountPrecision;
    return finalAmount;
}

async function testCreateOrderTryCancelOrder (exchange, symbol, order, skippedProperties) {
    // fetch order for maximum accuracy
    const orderFetched = await testSharedMethods.tryFetchOrder (exchange, symbol, order['id'], skippedProperties);
    // check their status
    const isClosedFetched = testSharedMethods.confirmOrderState (exchange, orderFetched, 'closed');
    const isOpenFetched = testSharedMethods.confirmOrderState (exchange, orderFetched, 'open');
    // if it was not reported as closed/filled, then try to cancel it
    if (isClosedFetched === undefined || isOpenFetched) {
        verboseOutput (exchange, symbol, 'trying to cancel the remaining amount of partially filled order...');
        try {
            await testCreateOrderCancelOrder (exchange, symbol, order['id']);
        } catch (e) {
            // we don't throw exception here, because order might have been closed/filled already, before 'cancelOrder' call reaches server, so it is tolerable
            console.log (warningPrefix + ' ' +  exchange['id'] + ' ' + symbol + ' order ' + order['id'] + ' a moment ago order was reported as pending, but could not be cancelled at this moment: ' + exchange.json (order) + '. Exception message: ' + e.toString ());
        }
    } else {
        verboseOutput (exchange, symbol, 'order is already closed/filled, no need to cancel it');
    }
}

function getTickSizeFromString (str) {
    const parts = str.split ('.');
    const afterDot = parts[1];
    return afterDot.length + ''; // transpiler trick
}

export default testCreateOrder;
