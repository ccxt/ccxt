
import assert from 'assert';
import testSharedMethods from './base/test.sharedMethods.js';
import testOrder from './base/test.order.js';
import Precise from '../../base/Precise.js';

// ----------------------------------------------------------------------------

// before this will become transpiled, temporarily use some variables & verbose logs for successfull JS debugging
const testName = 'testCreateOrder';
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
    const method = 'createOrder';
    if (!exchange.has[method]) {
        console.log (logPrefix, 'does not have method ', method, ' yet, skipping test...');
        return;
    }
    // ensure it has cancel (any) method, otherwise we should refrain from automatic test.
    assert (exchange.has['cancelOrder'] || exchange.has['cancelOrders'] || exchange.has['cancelAllOrders'], logPrefix + ' does not have cancelOrder|cancelOrders|canelAllOrders method, which is needed to make tests for `createOrder` method. Skipping the test...');

    // pre-define some coefficients, which will be used down below
    const limitPriceSafetyMultiplierFromMedian = 1.2;
    const market = exchange.market (symbol);

    // we need fetchBalance method to test out orders correctly
    if (!exchange.has['fetchBalance']) {
        assert (false, logPrefix + ' does not have fetchBalance() method, which is needed to make tests for `createOrder` method. Skipping the test...');
    }
    // ensure there is enough balance of 'quote' asset, because at first we need to 'buy' the base asset
    const balance = await exchange.fetchBalance ();
    const initialBaseBalance = balance[market['base']]['free'];
    const initialQuoteBalance = balance[market['quote']]['free'];
    assert (initialQuoteBalance !== undefined, logPrefix + ' - testing account not have enough balance of' + market['quote'] + ' in fetchBalance() which is required to test ' + method);
    verboseOutput (exchange, symbol, 'fetched balance for', symbol, ':', initialBaseBalance, market['base'], '/', initialQuoteBalance, market['quote']);
    // get best bid & ask
    const [ bestBid, bestAsk ] = await testSharedMethods.tryFetchBestBidAsk (exchange, 'createOrder', symbol);
    // get minimum order amount & cost
    const [ minimumAmountForBuy, minimumCostForBuy ] = getMinimumMarketCostAndAmountForBuy (exchange, market, bestAsk);

    // ****************************************** //
    // ************** [Scenario 1] ************** //
    // ****************************************** //
    try {
        // create a "limit order" which must be guaranteed not to get filled (i.e. being much far from the best bid|ask price)
        const limitBuyPrice_nonFillable = bestBid / limitPriceSafetyMultiplierFromMedian;
        const finalAmountToBuy = getMinimumAmountForLimitPrice (exchange, market, minimumAmountForBuy, minimumCostForBuy, limitBuyPrice_nonFillable);
        // @ts-ignore
        const buyOrder_nonFillable = await testCreateOrder_submitSafeOrder (exchange, symbol, 'limit', 'buy', finalAmountToBuy, limitBuyPrice_nonFillable, {}, skippedProperties);
        const buyOrder_nonFillable_fetched = await testSharedMethods.tryFetchOrder (exchange, symbol, buyOrder_nonFillable['id'], skippedProperties);
        // ensure that order is not filled
        const isClosed = testSharedMethods.confirmOrderState (exchange, buyOrder_nonFillable, 'closed');
        const isClosedFetched = testSharedMethods.confirmOrderState (exchange, buyOrder_nonFillable_fetched, 'closed');
        assert (!isClosed, logPrefix + ' order should not be filled, but it is. ' + JSON.stringify (buyOrder_nonFillable));
        assert (!isClosedFetched, logPrefix + ' order should not be filled, but it is. ' + JSON.stringify (buyOrder_nonFillable_fetched));
        // cancel the order
        await testCreateOrder_cancelOrder (exchange, symbol, buyOrder_nonFillable['id']);
        verboseOutput (exchange, symbol, 'SCENARIO 1 PASSED !!!');
    } catch (e) {
        throw new Error (logPrefix + ' ' + method + ' failed for Scenario 1: ' + e.toString ());
    }
    // *********** [Scenario 1 - END ] *********** //


    // ******************************************* //
    // ************** [Scenario 2] *************** //
    // ******************************************* //
    try {
        // create limit/market order which IS GUARANTEED to have a fill (full or partial), then sell the bought amount
        const limitBuyPrice_fillable = bestAsk * limitPriceSafetyMultiplierFromMedian;
        const finalAmountToBuy = getMinimumAmountForLimitPrice (exchange, market, minimumAmountForBuy, minimumCostForBuy, limitBuyPrice_fillable);
        // @ts-ignore
        const buyOrder_fillable = await testCreateOrder_submitSafeOrder (exchange, symbol, 'limit', 'buy', finalAmountToBuy, limitBuyPrice_fillable, {}, skippedProperties);
        // try to cancel remnant (if any) of order
        await testCreateOrder_tryCancelOrder (exchange, symbol, buyOrder_fillable, skippedProperties);
        // now, as order is closed/canceled, we can reliably fetch the order information
        const buyOrder_filled_fetched = await testSharedMethods.tryFetchOrder (exchange, symbol, buyOrder_fillable['id'], skippedProperties);
        // we need to find out the amount of base asset that was bought
        let amountToSell = undefined;
        //@ts-ignore
        if (buyOrder_filled_fetched['filled'] !== undefined) {
            //@ts-ignore
            amountToSell = buyOrder_filled_fetched['filled'];
        } else {
            // if it was not reported, then the last step is to re-fetch balance and sell all target tokens (don't worry, it will not sell much, as the test reached here, it means that even the minimum sell amount execution had failed because of insufficient coins, so, all this will sell is whatever small amount exists in wallet)
            const balance = await exchange.fetchBalance ();
            // subtract the initial balance from the current balance to find out the amount of base asset that was bought
            // @ts-ignore
            amountToSell = balance[market['base']]['free'] - ((initialBaseBalance !== undefined) ? initialBaseBalance : 0);
        }
        // We should use 'reduceOnly' to ensure we don't open a margin-ed position accidentally (i.e. on FTX you can open a margin position with sell order even if you don't have target base coin to sell)
        let params = { 'reduceOnly': true };
        let priceForMarketSellOrder = undefined;
        if (exchange.id === 'binance') {
            // @ts-ignore
            params = {};  // because of temporary bug, we should remove 'reduceOnly' from binance createOrder for spot (it should be fixed)
            // @ts-ignore
            priceForMarketSellOrder = (minimumCostForBuy / amountToSell) * limitPriceSafetyMultiplierFromMedian;
        }
        const sellOrder = await testCreateOrder_submitSafeOrder (exchange, symbol, 'market', 'sell', amountToSell, priceForMarketSellOrder, params, skippedProperties);
        const sellOrder_fetched = await testSharedMethods.tryFetchOrder (exchange, symbol, sellOrder['id'], skippedProperties);
        // try to test that order was fully filled
        const isClosedFetched = testSharedMethods.confirmOrderState (exchange, sellOrder_fetched, 'closed');
        const isOpenFetched = testSharedMethods.confirmOrderState (exchange, sellOrder_fetched, 'open');
        assert (isClosedFetched || isOpenFetched === undefined, warningPrefix + ' ' +  exchange.id + ' ' + symbol + ' order should be filled, but it is not. ' + exchange.json (sellOrder_fetched));
        verboseOutput (exchange, symbol, 'SCENARIO 2 PASSED !!!');
    } catch (e) {
        throw new Error ('failed for Scenario 2: ' + e.toString ());
    }
    // *********** [Scenario 2 - END ] *********** //


    // ***********
    // above, we already tested 'limit' and 'market' orders. next, 'todo' is to create tests for other unified scenarios (spot, swap, trigger, positions, stoploss, takeprofit, etc)
    // ***********
}

// ----------------------------------------------------------------------------

async function testCreateOrder_cancelOrder (exchange, symbol, orderId = undefined) {
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

async function testCreateOrder_submitSafeOrder (exchange, symbol, orderType, side, amount, price = undefined, params = {}, skippedProperties = {}) {
    verboseOutput (exchange, symbol, 'Executing createOrder', symbol, orderType, side, amount, price, params);
    const order = await exchange.createOrder (symbol, orderType, side, amount, price, params);
    try {
        // test through regular order object test
        testOrder (exchange, skippedProperties, 'createOrder', order, symbol, Date.now ());
    } catch (e) {
        // if test failed for some reason, then we stop any futher testing and throw exception. However, before it, we should try to cancel that order, if possible.
        if (orderType !== 'market') // market order is not cancelable
        {
            await testCreateOrder_tryCancelOrder (exchange, symbol, order, skippedProperties);
        }
        // now, we can throw the initial error
        throw e;
    }
    return order;
}

function getMinimumMarketCostAndAmountForBuy (exchange, market, askPrice) {
    let minimumCostLimitForBuy = undefined;
    let minimumAmountLimitForBuy = undefined;
    // Intentionally add a tiny increment to the minimum amount/cost, to test & ensure that it will not cause precision issues (thus we ensure that implementation handles them)
    const fractionalAddition = 1e-14; // smaller than this causes precision issues in JS, i.e. 10 + 1e-16 = 10
    const costValues = exchange.safeValue (market['limits'], 'cost', {});
    const costMin = exchange.safeNumber (costValues, 'min');
    if (costMin !== undefined) {
        minimumCostLimitForBuy = costMin + fractionalAddition;
    }
    const amountValues = exchange.safeValue (market['limits'], 'amount', {});
    const amountMin = exchange.safeNumber (amountValues, 'min');
    if (amountMin !== undefined) {
        minimumAmountLimitForBuy = amountMin + fractionalAddition;
    }
    assert (minimumAmountLimitForBuy !== undefined || minimumCostLimitForBuy !== undefined, exchange.id + ' can not determine minimum amount/cost of order for ' + market['symbol']);
    verboseOutput (exchange, market['symbol'], 'found market minimums - amount:', amountMin, ',  cost :', costMin);
    return [ minimumAmountLimitForBuy, minimumCostLimitForBuy ];
}

function getMinimumAmountForLimitPrice (exchange, market, amount, cost, price) {
    // to avoid rounding/precision glitches, let's add a tiny fraction to the minimum amount
    const orderAmountSafetyMultiplier = 1.02;
    const orderCostSafetyMultiplier = 1.02;
    let finalAmountToBuy = undefined;
    if (cost === undefined) {
        finalAmountToBuy = amount;
    } else {
        // some exchanges require total cost (notional) to be above specific value. So, we need to calculate the order size suitable for our limit-price
        // @ts-ignore
        finalAmountToBuy = (cost * orderCostSafetyMultiplier / price);
    }
    // @ts-ignore
    finalAmountToBuy = finalAmountToBuy * orderAmountSafetyMultiplier;
    const ROUND_UP = 2; // temp avoid import "numbers"
    finalAmountToBuy = exchange.decimalToPrecision (finalAmountToBuy, ROUND_UP, market['precision']['amount'], exchange.precisionMode);
    return parseFloat (finalAmountToBuy);
}

async function testCreateOrder_tryCancelOrder (exchange, symbol, order, skippedProperties) {
    // fetch order for maximum accuracy
    const orderFetched = await testSharedMethods.tryFetchOrder (exchange, symbol, order['id'], skippedProperties);
    // check their status
    const isClosedFetched = testSharedMethods.confirmOrderState (exchange, orderFetched, 'closed');
    const isOpenFetched = testSharedMethods.confirmOrderState (exchange, orderFetched, 'open');
    // if it was not reported as closed/filled, then try to cancel it
    if (isClosedFetched === undefined || isOpenFetched) {
        verboseOutput (exchange, symbol, 'trying to cancel the remaining amount of partially filled order...');
        try {
            await testCreateOrder_cancelOrder (exchange, symbol, order['id']);
        } catch (e) {
            // we don't throw exception here, because order might have been closed/filled already, before 'cancelOrder' call reaches server, so it is tolerable
            console.log (warningPrefix + ' ' +  exchange['id'] + ' ' + symbol + ' order ' + order['id'] + ' a moment ago order was reported as pending, but could not be cancelled at this moment: ' + exchange.json (order) + '. Exception message: ' + e.toString ());
        }
    } else {
        verboseOutput (exchange, symbol, 'order is already closed/filled, no need to cancel it');
    }
}

export default testCreateOrder;
