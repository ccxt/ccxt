
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
    const limitPriceSafetyMultiplierFromMedian = 1.045; // todo: in future, if ccxt would have "maximum limit price diapason" precisions unified, we can use those coefficients, but at this moment, differet exchanges have different coefficients. for example, unlike spot-market, binance's future market has 5% boundary for limit order prices, which means you can't place limit order higher than current price * 5% (i.e. for BTC/USDT market). So, at this moment, around 5% is acceptable guaranteed price where order will get filled like market order.
    const market = exchange.market (symbol);

    // we need fetchBalance method to test out orders correctly
    assert (exchange.has['fetchBalance'], logPrefix + ' does not have fetchBalance() method, which is needed to make tests for `createOrder` method. Skipping the test...');
    // ensure there is enough balance of 'quote' asset, because at first we need to 'buy' the base asset
    const balance = await exchange.fetchBalance ();
    const initialBaseBalance = balance[market['base']]['free'];
    const initialQuoteBalance = balance[market['quote']]['free'];
    verboseOutput (exchange, symbol, 'fetched balance for', symbol, ':', initialBaseBalance, market['base'], '/', initialQuoteBalance, market['quote']);
    // get best bid & ask
    const [ bestBid, bestAsk ] = await testSharedMethods.tryFetchBestBidAsk (exchange, 'createOrder', symbol);
    const minimunPrices = exchange.safeValue (market['limits'], 'price', {});
    const minimumPrice = exchange.safeNumber (minimunPrices, 'min');
    const maximumPrice = exchange.safeNumber (minimunPrices, 'max');

    // ****************************************** //
    // ************** [Scenario 1] ************** //
    // ****************************************** //
    try {
        // create a "limit order" which must be guaranteed not to get filled (i.e. being much far from the real price)
        const limitBuyPrice_nonFillable = bestBid / limitPriceSafetyMultiplierFromMedian; // minimum limit price is not good here, as it's unrealistic and leads to unrealistic amounts because of cost equation, like buying 30k bitcoins for 0.01 USD (min limit) price
        const finalAmountToBuy = getMinimumAmountForLimitPrice (exchange, market, limitBuyPrice_nonFillable);
        const buyOrder_nonFillable = await testCreateOrderSubmitSafeOrder (exchange, symbol, 'limit', 'buy', finalAmountToBuy, limitBuyPrice_nonFillable, {}, skippedProperties);
        const buyOrder_nonFillable_fetched = await testSharedMethods.tryFetchOrder (exchange, symbol, buyOrder_nonFillable['id'], skippedProperties);
        // ensure that order is not filled
        const isClosed = testSharedMethods.confirmOrderState (exchange, buyOrder_nonFillable, 'closed');
        const isClosedFetched = testSharedMethods.confirmOrderState (exchange, buyOrder_nonFillable_fetched, 'closed');
        assert (!isClosed, logPrefix + ' order should not be filled, but it is. ' + JSON.stringify (buyOrder_nonFillable));
        assert (!isClosedFetched, logPrefix + ' order should not be filled, but it is. ' + JSON.stringify (buyOrder_nonFillable_fetched));
        // cancel the order
        await testCreateOrderCancelOrder (exchange, symbol, buyOrder_nonFillable['id']);
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
        const finalAmountToBuy = getMinimumAmountForLimitPrice (exchange, market, limitBuyPrice_fillable);
        const buyOrder_fillable = await testCreateOrderSubmitSafeOrder (exchange, symbol, 'limit', 'buy', finalAmountToBuy, limitBuyPrice_fillable, {}, skippedProperties);
        // try to cancel remnant (if any) of order
        await testCreateOrderTryCancelOrder (exchange, symbol, buyOrder_fillable, skippedProperties);
        // now, as order is closed/canceled, we can reliably fetch the order information
        const buyOrder_filled_fetched = await testSharedMethods.tryFetchOrder (exchange, symbol, buyOrder_fillable['id'], skippedProperties);
        // we need to find out the amount of base asset that was bought
        assert (buyOrder_filled_fetched['filled'] !== undefined, logPrefix + ' ' +  exchange.id + ' ' + symbol + ' order should be filled, but it is not. ' + exchange.json (buyOrder_filled_fetched));
        const amountToSell = buyOrder_filled_fetched['filled'];
        // if (buyOrder_filled_fetched['filled'] === undefined) {
        //     // if it was not reported, then the last step is to re-fetch balance and sell all target tokens, subtract the initial balance from the current balance to find out the amount of base asset that was bought
        //     const balance = await exchange.fetchBalance ();
        //     amountToSell = balance[market['base']]['free'] - ((initialBaseBalance !== undefined) ? initialBaseBalance : 0);
        // }
        //
        // We should use 'reduceOnly' to ensure we don't open a margin-ed position accidentally (i.e. on some exchanges it might lead to margin-sell, so let's be safe by using reduceOnly )
        const params = {};
        let priceForMarketSellOrder = undefined;
        if (exchange.id === 'binance') {
            const minimumCostForBuy = getMinimumCostForBuy (exchange, market);
            priceForMarketSellOrder = (minimumCostForBuy / amountToSell) * limitPriceSafetyMultiplierFromMedian;
        }
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
    // *********** [Scenario 2 - END ] *********** //


    // ***********
    // above, we already tested 'limit' and 'market' orders. next, 'todo' is to create tests for other unified scenarios (spot, swap, trigger, positions, stoploss, takeprofit, etc)
    // ***********
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

function getMinimumAmountForBuy (exchange, market) {
    // todo: In future, intentionally add a tiny increment to the minimum amount/cost, to test & ensure that it will not cause precision issues (thus we ensure that implementation handles them)
    const amountValues = exchange.safeValue (market['limits'], 'amount', {});
    const amountMin = exchange.safeNumber (amountValues, 'min');
    assert (amountMin !== undefined,  exchange.id + ' ' +  market['symbol'] + ' can not determine minimum amount for order');
    return amountMin;
}

function getMinimumCostForBuy (exchange, market) {
    const costValues = exchange.safeValue (market['limits'], 'cost', {});
    const costMin = exchange.safeNumber (costValues, 'min');
    assert (costMin !== undefined, exchange.id + ' ' +  market['symbol'] + ' can not determine minimum cost for order');
    return costMin;
}


function getMinimumAmountForLimitPrice (exchange, market, price) {
    const minimumAmount = getMinimumAmountForBuy (exchange, market);
    const minimumCost = getMinimumCostForBuy (exchange, market);
    // as prices volatile constantly, "minimum limits" also change constantly, so we'd better add some tiny diapason to be sure that order will successfully accepted
    let finalAmountToBuy = minimumAmount;
    if (minimumCost !== undefined) {
        // minimum amount is not enough for order (because it's almost permanent minimum amount defined once by exchange), instead it's important that order met minimum cost(notional) requirement
        finalAmountToBuy = (minimumCost / price);
    }
    // the current value might be too long (i.e. 0.12345678) and inside 'createOrder' it's being truncated down. It might cause our automatic cost calcuation accidentaly to be less than "market->limits->cost>min", so, before it, we should round it up to nearest precision, thus we ensure the overal cost will be above minimum requirements
    finalAmountToBuy = parseFloat (exchange.decimalToPrecision (finalAmountToBuy, 2, market['precision']['amount'], exchange.precisionMode)); // 2 stands for ROUND_UP constant, 0 stands for truncate
    if (minimumCost !== undefined && finalAmountToBuy * price < minimumCost) {
        // again, because it's still possible that above decimalToPrecision truncates down (idk bug or not, i.e. 0.49 amount might get truncated down to 0.4), we should ensure that final amount*price would bypass minimum cost requirements
        const precisions = market['precision'];
        const amountPrecision = exchange.safeNumber (precisions, 'amount');
        if (amountPrecision && exchange.precisionMode === 4) {
            // if TICKSIZE, then it's direct amount
            finalAmountToBuy = finalAmountToBuy + amountPrecision;
        } else {
            const digitsOfPrecision = amountPrecision ? amountPrecision : parseInt (exchange.precisionFromString (exchange.numberToString (finalAmountToBuy)));
            finalAmountToBuy = finalAmountToBuy + 1 / Math.pow (10, digitsOfPrecision);
        }
    }
    return finalAmountToBuy;
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

export default testCreateOrder;
