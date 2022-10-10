'use strict'

// ----------------------------------------------------------------------------

const ccxt = require ('../../../ccxt.js');
const assert = require ('assert');
const testOrder = require ('./test.order.js');
const Precise = require ('../../base/Precise');
// ----------------------------------------------------------------------------

// before this will become transpiled, temporarily use some variables & verbose logs for successfull JS debugging
const testName = 'testCreateOrder';
const warningPrefix = ' !!! ' + testName;
const debugPrefix = ' >>> ' + testName;
const isVerbose = true // process.argv.includes ('--verbose');
function verboseOutput (exchange, symbol, ...args) {
    if (isVerbose) {
        console.log (debugPrefix + ' [' + exchange['id'] + ' : ' + symbol + '] ', ...args);
    }
}
// ----------------------------------------------------------------------------

async function testCreateOrder(exchange, symbol) {
    const method = 'createOrder';
    if (!exchange.has[method]) {
        console.log (warningPrefix, exchange.id, 'does not have method ', method, ' yet, skipping test...');
        return;
    }
    // skip some exchanges
    const skippedExchanges = [];
    if (skippedExchanges.includes (exchange.id)) {
        console.log (warningPrefix, exchange.id, 'found in ignored exchanges, skipping ' + method + ' test...');
        return;
    }
    // as this test is in it's early stages, we'd better o make a whitelist of exchanges where this will be tested reliably. After some period, we will remove the whitelist and test all exchanges
    const whitelistedExchanges = [ 'binance', 'ftx' ];
    if (!whitelistedExchanges.includes (exchange.id)) {
        console.log (warningPrefix, exchange.id, 'is not in whitelist for test, skipping ', method, ' test...');
        return;
    }
    // ensure it has cancel (any) method, otherwise we should refrain from automatic test.
    if (!exchange.has['cancelOrder'] && !exchange.has['cancelOrders'] && !exchange.has['cancelAllOrders']) {
        assert (false, warningPrefix + ' ' +  exchange.id + ' does not have cancelOrder|cancelOrders|canelAllOrders method, which is needed to make tests for `createOrder` method. Skipping the test...');
        return;
    }

    const limitPriceSafetyMultiplierFromMedian = 1.2;
    const market = exchange.market (symbol);

    // we need fetchBalance method to test out orders correctly
    if (!exchange.has['fetchBalance']) {
        assert (false, warningPrefix + ' ' +  exchange.id + ' does not have fetchBalance() method, which is needed to make tests for `createOrder` method. Skipping the test...');
    }
    // ensure there is enough balance of 'quote' asset, because at first we need to 'buy' the base asset
    const balance = await exchange.fetchBalance ();
    const initialBaseBalance = balance[market['base']]['free'];
    const initialQuoteBalance = balance[market['quote']]['free'];
    if (initialQuoteBalance === undefined) {
        assert (false, warningPrefix + ' ' +  exchange.id + ' does not have enough balance of' + market['quote'] + ' in fetchBalance() which is required to test ' + method);
    }
    verboseOutput (exchange, symbol, 'fetched balance for', symbol,':', initialBaseBalance, market['base'], '/', initialQuoteBalance, market['quote']);
    // get best bid & ask
    const [bestBid, bestAsk] = await testCreateOrder_getBestBidAsk (exchange, symbol);
    // get minimum order amount & cost
    let [minimumAmountForBuy, minimumCostForBuy ] = getMinimumMarketCostAndAmountForBuy (exchange, market, bestAsk);
    if (minimumAmountForBuy === undefined || minimumCostForBuy === undefined) {
        assert (false, warningPrefix + ' ' +  exchange.id + ' can not determine minimum amount/cost of order for ' + symbol + ' market');
    }
    verboseOutput (exchange, symbol, 'minimum amount should be:', minimumAmountForBuy, ', minimum cost should be:', minimumCostForBuy);

    // ************************************ //
    // *********** [Scenario 1] *********** //
    // ************************************ //
    try{
        // create limit order which IS GUARANTEED not to be filled (far from the best bid|ask price)
        const limitBuyPrice_nonFillable = bestBid / limitPriceSafetyMultiplierFromMedian;
        const buyOrder_nonFillable = await testCreateOrder_submitSafeOrder (exchange, symbol, 'limit', 'buy', minimumAmountForBuy, limitBuyPrice_nonFillable, {});
        const buyOrder_nonFillable_fetched = await testCreateOrder_fetchOrder (exchange, symbol, buyOrder_nonFillable['id']);
        // ensure that order is not filled
        const isClosed = testCreateOrder_orderIs (exchange, buyOrder_nonFillable, 'closed');
        const isClosedFetched = testCreateOrder_orderIs (exchange, buyOrder_nonFillable_fetched, 'closed');
        assert (!isClosed, warningPrefix + ' ' +  exchange.id + ' ' + symbol + ' order should not be filled, but it is. ' + JSON.stringify (buyOrder_nonFillable));
        assert (!isClosedFetched, warningPrefix + ' ' +  exchange.id + ' ' + symbol + ' order should not be filled, but it is. ' + JSON.stringify (buyOrder_nonFillable_fetched));
        // cancel the order
        await testCreateOrder_cancelOrder (exchange, symbol, buyOrder_nonFillable['id']);
        verboseOutput (exchange, symbol, 'SCENARIO 1 PASSED !!!');
    } catch (e) {
        assert (false, warningPrefix + ' ' +  exchange.id + ' ' + symbol + ' ' + method + ' failed for Scenario 1: ' + e.message);
    }
    // *********** [Scenario 1 - END ] *********** //

    // ************************************ //
    // *********** [Scenario 2] *********** //
    // ************************************ //
    try{
        // create limit/market order which IS GUARANTEED to have a fill (full or partial), then sell the bought amount
        const limitBuyPrice_fillable = bestAsk * limitPriceSafetyMultiplierFromMedian;
        const buyOrder_fillable = await testCreateOrder_submitSafeOrder (exchange, symbol, 'limit', 'buy', minimumAmountForBuy, limitBuyPrice_fillable, {});
        // try to cancel remnant (if any) of order
        testCreateOrder_tryCancelOrder (exchange, symbol, buyOrder_fillable);
        // now, as order is closed/canceled, we can reliably fetch the order information
        const buyOrder_filled_fetched = await testCreateOrder_fetchOrder (exchange, symbol, buyOrder_fillable['id']);
        // we need to find out the amount of base asset that was bought
        let amountToSell = undefined;
        if (buyOrder_filled_fetched['filled'] !== undefined) {
            amountToSell = buyOrder_filled_fetched['filled'];
        } else {
            // if it was not reported, then the last step is to re-fetch balance and sell all target tokens (don't worry, it will not sell much, as the test reached here, it means that even the minimum sell amount execution had failed because of insufficient coins, so, all this will sell is whatever small amount exists in wallet)
            const balance = await exchange.fetchBalance ();
            // subtract the initial balance from the current balance to find out the amount of base asset that was bought
            amountToSell = balance[market['base']]['free'] - ((initialBaseBalance !== undefined) ? initialBaseBalance : 0);
        }
        const sellOrder = await testCreateOrder_submitSafeOrder (exchange, symbol, 'market', 'sell', amountToSell, undefined, {'reduceOnly': true}); // we use 'reduceOnly' to ensure we don't open a margin-ed position accidentally
        const sellOrder_fetched = await testCreateOrder_fetchOrder (exchange, symbol, sellOrder['id']);
        // try to test that order was fully filled
        const isClosedFetched = testCreateOrder_orderIs(exchange, sellOrder_fetched, 'closed');
        const isOpenFetched = testCreateOrder_orderIs(exchange, sellOrder_fetched, 'open');
        assert (isClosedFetched || isOpenFetched === undefined, warningPrefix + ' ' +  exchange.id + ' ' + symbol + ' order should be filled, but it is not. ' + exchange.json (sellOrder_fetched));
        verboseOutput (exchange, symbol, 'SCENARIO 2 PASSED !!!');
    } catch (e) {
        assert (false, warningPrefix + ' ' +  exchange.id + ' ' + symbol + ' ' + method + ' failed for Scenario 2: ' + e.message);
    }
    // *********** [Scenario 2 - END ] *********** //


    // ***********
    // above, we already tested 'limit' and 'market' orders. next, 'todo' is to create tests for other unified scenarios (spot, swap, trigger, positions, stoploss, takeprofit, etc)
    // ***********
}

// ----------------------------------------------------------------------------

async function testCreateOrder_getBestBidAsk (exchange, symbol) {
    // find out best bid/ask price to determine the entry prices
    let bestBid = undefined;
    let bestAsk = undefined;

    let usedMethod = undefined;
    if (exchange.has['fetchOrderBook']) {
        usedMethod = 'fetchOrderBook';
        const orderbook = await exchange.fetchOrderBook (symbol);
        bestBid = orderbook.bids[0][0];
        bestAsk = orderbook.asks[0][0];
    } else if (exchange.has['fetchTicker']) {
        usedMethod = 'fetchTicker';
        const ticker = await exchange.fetchTicker (symbol);
        bestBid = ticker.bid;
        bestAsk = ticker.ask;
    } else if (exchange.has['fetchTickers']) {
        usedMethod = 'fetchTickers';
        const tickers = await exchange.fetchTickers ([symbol]);
        bestBid = tickers[symbol].bid;
        bestAsk = tickers[symbol].ask;
    } else if (exchange.has['fetchL1OrderBooks']) {
        usedMethod = 'fetchL1OrderBooks';
        const tickers = await exchange.fetchL1OrderBooks ([symbol]);
        bestBid = tickers[symbol].bid;
        bestAsk = tickers[symbol].ask;
    } else if (exchange.has['fetchBidsAsks']) {
        usedMethod = 'fetchBidsAsks';
        const tickers = await exchange.fetchBidsAsks ([symbol]);
        bestBid = tickers[symbol].bid;
        bestAsk = tickers[symbol].ask;
    }
    //
    if (bestBid === undefined || bestAsk === undefined) {
        assert (false, warningPrefix + ' ' +  exchange.id + ' could not get best bid/ask, skipping ' + method + ' test...');
    }
    // ensure values are correct
    assert ( (bestBid !== undefined) && (bestAsk !== undefined) && (bestBid > 0) || (bestAsk > 0) && (bestBid >= bestAsk), warningPrefix + ' ' +  exchange.id + ' best bid/ask seem incorrect. Bid:' + bestBid + ' Ask:' + bestAsk);
    verboseOutput (exchange, symbol, 'fetched best bid/ask using', usedMethod, '- Bid:', bestBid, ' Ask:', bestAsk);
    return [ bestBid, bestAsk ];
}

// ----------------------------------------------------------------------------

async function testCreateOrder_fetchOrder (exchange, symbol, orderId) {
    let fetchedOrder = undefined;
    let usedMethod = undefined;
    let originalId = orderId;
    // set 'since' to 5 minute ago for optimal results
    const sinceTime = Date.now () - 1000 * 60 * 5; 
    //
    // search through singular methods
    for (const singularFetchName of ['fetchOrder', 'fetchOpenOrder', 'fetchClosedOrder', 'fetchCanceledOrder']) {
        if (exchange.has[singularFetchName]) {
            usedMethod = singularFetchName;
            const currentOrder = await exchange[singularFetchName] (originalId, symbol);
            // if there is an id inside the order, it means the order was fetched successfully
            if (currentOrder.id === originalId) {
                fetchedOrder = currentOrder;
                break;
            }
        }
    }
    //
    // search through plural methods
    if (fetchedOrder === undefined) {
        for (const pluralFetchName of ['fetchOrders', 'fetchOpenOrders', 'fetchClosedOrders', 'fetchCanceledOrders']) {
            if (exchange.has[pluralFetchName]) {
                usedMethod = pluralFetchName;
                const orders = await exchange[pluralFetchName] (symbol, sinceTime);
                let found = false;
                for (let i = 0; i < orders.length; i++) {
                    const currentOrder = orders[i];
                    if (currentOrder.id === originalId) {
                        fetchedOrder = currentOrder;
                        found = true;
                        break;
                    }
                }
                if (found) {
                    break;
                }
            }
        }
    }
    // test fetched order object
    if (fetchedOrder !== undefined) {
        testOrder (exchange, fetchedOrder, symbol, Date.now ());
    }
    if (usedMethod !== undefined) {
        verboseOutput (exchange, symbol, 'fetched order using', usedMethod);
    }
    return fetchedOrder;
}

// ----------------------------------------------------------------------------

async function testCreateOrder_cancelOrder (exchange, symbol, orderId = undefined) {
    // cancel the order (one of the below methods is guaranteed to be existent, as this was checked in the start of this test)
    let usedMethod = undefined;
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
            cancelResult = await exchange.cancelOrders ([orderId], symbol);
        }
    }
    verboseOutput (exchange, symbol, 'canceled order using', usedMethod, ' : ', exchange.json (cancelResult));
}

// ----------------------------------------------------------------------------

function testCreateOrder_orderIs (exchange, order, statusSlug) {
    const filled_amount = exchange.safeString (order, 'filled');
    const whole_amount = exchange.safeString (order, 'amount');
    if (statusSlug === 'open') {
        if (order['status'] === 'open' || (order['status'] === undefined && filled_amount !== undefined && whole_amount !== undefined && filled_amount < whole_amount)) {
            return true;
        }
    } else if (statusSlug === 'closed') {
        if (order['status'] === 'closed' || order['status'] === 'canceled' || (order['status'] === undefined && filled_amount !== undefined && whole_amount !== undefined && Precise.stringEq (filled_amount,whole_amount))) {
            return true;
        }
    }
    // if above is not obvious, we can't say that it answer should be 'false', because we don't have enough indications to be sure
    return undefined;
}

// ----------------------------------------------------------------------------

async function testCreateOrder_submitSafeOrder (exchange, symbol, orderType, side, amount, price = undefined, params = {}) {
    verboseOutput (exchange, symbol, 'Executing createOrder', symbol, orderType, side, amount, price, params);
    let order = await exchange.createOrder (symbol, orderType, side, amount, price, params);
    try {
        // test through regular order object test
        testOrder (exchange, order, symbol, Date.now ());
    } catch (e) {
        // if test failed for some reason, then we stop any futher testing and throw exception. However, before it, we should try to cancel that order, if possible.
        if (orderType !== 'market') // market order is not cancelable
        {
            testCreateOrder_tryCancelOrder (exchange, symbol, order);
        }
        // now, we can throw the initial error
        assert (false, warningPrefix + ' ' +  exchange.id + ' failed to createOrder: ' + e.message);
    }
    return order;
}

function getMinimumMarketCostAndAmountForBuy (exchange, market, askPrice = undefined) {
    // pre-define some coefficients, which will be used down below
    const orderCostSafetyMultiplier = 1.01;
    const orderAmountSafetyMultiplier = 1.01;
    const orderPriceSafetyMultiplier = 1.2;
    // define how much to spend (it's enough to be around minimal required cost)
    let minimumCostLimitForBuy = undefined;
    let minimumAmountLimitForBuy = undefined;
    if (market['limits']['cost']['min']) {
        minimumCostLimitForBuy = market['limits']['cost']['min'];
    }
    if (market['limits']['amount']['min']) {
        // as we know the minimal amount, we can calculate the approximate cost for purchase
        minimumAmountLimitForBuy = market['limits']['amount']['min'];
    }

    let finalAmountForBuy = minimumAmountLimitForBuy;
    let finalCostForBuy = minimumCostLimitForBuy;
    // Some exchanges accept the "minimum amount" (independent of the overal cost), but other exchanges also need that order was also above "minimum cost". So, we choose the maximum of both values
    if (finalCostForBuy !== undefined && finalAmountForBuy !== undefined) {
        let approxAmountForCost = finalCostForBuy / (askPrice * orderPriceSafetyMultiplier);
        finalAmountForBuy = Math.max (finalAmountForBuy, approxAmountForCost);
    }

    // Intentionally add a tiny increment to the minimum amount/cost, to test & ensure that it will not cause precision issues (thus we ensure that implementation handles them)
    if (finalAmountForBuy) {
        finalAmountForBuy = finalAmountForBuy + 0.000000000000000001;
    }
    if (finalCostForBuy) {
        finalCostForBuy = finalCostForBuy + 0.000000000000000001;
    }
    return [ finalAmountForBuy, finalCostForBuy ];
}

async function testCreateOrder_tryCancelOrder (exchange, symbol, order) {
    // fetch order for maximum accuracy
    const orderFetched = await testCreateOrder_fetchOrder (exchange, symbol, order['id']);
    // check their status
    const isClosedFetched = testCreateOrder_orderIs (exchange, orderFetched, 'closed');
    const isOpenFetched = testCreateOrder_orderIs (exchange, orderFetched, 'open');
    // if it was not reported as closed/filled, then try to cancel it
    if (isClosedFetched === undefined || isOpenFetched) {
        verboseOutput (exchange, symbol, 'trying to cancel the remaining amount of partially filled order...');
        try {
            await testCreateOrder_cancelOrder (exchange, symbol, order['id']);
        } catch (e) {
            // we don't throw exception here, because order might have been closed/filled already, before 'cancelOrder' call reaches server, so it is tolerable
            console.log (warningPrefix + ' ' +  exchange['id'] + ' ' + symbol + ' order ' + order['id'] + ' a moment ago order was reported as pending, but could not be cancelled at this moment: ' + exchange.json (order) + '. Exception message: ' + e.message);
        }
    } else {
        verboseOutput (exchange, symbol, 'order is already closed/filled, no need to cancel it');
    }
}

module.exports = testCreateOrder;
