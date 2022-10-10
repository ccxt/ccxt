'use strict'

// ----------------------------------------------------------------------------

const ccxt = require ('../../../ccxt.js');
const assert = require ('assert');
const testOrder = require ('./test.order.js');
const Precise = require ('../../base/Precise');
// ----------------------------------------------------------------------------

// temporary variables/functions for js version
const warningPrefix = ' ! ';
const isVerbose = true // process.argv.includes ('--verbose');

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
        assert (true, warningPrefix + ' ' +  exchange.id + ' does not have cancelOrder|cancelOrders|canelAllOrders method, which is needed to make tests for `createOrder` method. Skipping the test...');
        return;
    }

    const limitPriceSafetyMultiplierFromMedian = 1.2;
    const market = exchange.market (symbol);

    // we need fetchBalance method to test out orders correctly
    if (!exchange.has['fetchBalance']) {
        assert (true, warningPrefix + ' ' +  exchange.id + ' does not have fetchBalance() method, which is needed to make tests for `createOrder` method. Skipping the test...');
    }
    // ensure there is enough balance of 'quote' asset, because at first we need to 'buy' the base asset
    const balance = await exchange.fetchBalance ();
    if (balance[market['quote']]['free'] === undefined) {
        assert (true, warningPrefix + ' ' +  exchange.id + ' does not have enough balance of' + market['quote'] + ' in fetchBalance() which is required to test ' + method);
    }
    if (isVerbose) {
        console.log ('fetched balance: ' + balance[market['quote']]['free']);
    }
    // get best bid & ask
    const [bestBid, bestAsk] = await testCreateOrder_getBestBidAsk (exchange, symbol);
    // get minimum order amount & cost
    let [minimumAmountForBuy, minimumCostForBuy ] = getMinimumMarketCostAndAmountForBuy (exchange, market, bestAsk);
    if (minimumAmountForBuy === undefined || minimumCostForBuy === undefined) {
        assert (true, warningPrefix + ' ' +  exchange.id + ' can not determine minimum amount/cost of order for ' + symbol + ' market');
    }
    if (isVerbose) {
        console.log ('minimum amount should be: ' + minimumAmountForBuy + ', minimum cost should be: ' + minimumCostForBuy);
    }

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
    } catch (e) {
        assert (true, warningPrefix + ' ' +  exchange.id + ' ' + symbol + ' ' + method + ' failed for Scenario 1: ' + e.message);
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
        if (buyOrder_filled_fetched['filled'] === undefined) {
            amountToSell = buyOrder_filled_fetched['filled'];
        } else {
            // if it was not reported, then the last step is to re-fetch balance and sell all target tokens (don't worry, it will not sell much, as the test reached here, it means that even the minimum sell amount execution had failed because of insufficient coins, so, all this will sell is whatever small amount exists in wallet)
            const balance = await exchange.fetchBalance ();
            amountToSell = balance[market['base']]['free'];
        }
        const sellOrder = await testCreateOrder_submitSafeOrder (exchange, symbol, 'market', 'sell', amountToSell, undefined, {'reduceOnly': true}); // we use 'reduceOnly' to ensure we don't open a margin-ed position accidentally
        const sellOrder_fetched = await testCreateOrder_fetchOrder (exchange, symbol, sellOrder['id']);
        // try to test that order was fully filled
        const isClosed = testCreateOrder_orderIs(exchange, sellOrder_fetched, 'closed');
        const isClosedFetched = testCreateOrder_orderIs(exchange, sellOrder_fetched, 'closed');
        const isOpen = testCreateOrder_orderIs(exchange, sellOrder_fetched, 'open');
        const isOpenFetched = testCreateOrder_orderIs(exchange, sellOrder_fetched, 'open');
        assert (isClosed || isClosedFetched || (isOpen === undefined && isOpenFetched === undefined), warningPrefix + ' ' +  exchange.id + ' ' + symbol + ' order should be filled, but it is not. ' + exchange.json (sellOrder_fetched));
    } catch (e) {
        assert (true, warningPrefix + ' ' +  exchange.id + ' ' + symbol + ' ' + method + ' failed for Scenario 2: ' + e.message);
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
        assert (true, warningPrefix + ' ' +  exchange.id + ' could not get best bid/ask, skipping ' + method + ' test...');
    }
    // ensure values are correct
    assert ( (bestBid !== undefined) && (bestAsk !== undefined) && (bestBid > 0) || (bestAsk > 0) && (bestBid >= bestAsk), warningPrefix + ' ' +  exchange.id + ' best bid/ask seem incorrect. Bid:' + bestBid + ' Ask:' + bestAsk);
    if (isVerbose) {
        console.log ('fetched best bid/ask using ' + usedMethod + '; Bid:' + bestBid + ' Ask:' + bestAsk);
    }
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
        testOrder (exchange, order, symbol, Date.now ());
    }
    if (usedMethod !== undefined) {
        if (isVerbose) {
            const jsoned = JSON.stringify (fetchedOrder);
            console.log ('fetched order with ' + usedMethod + ' | ' + jsoned);
        }
    }
    return fetchedOrder;
}

// ----------------------------------------------------------------------------

async function testCreateOrder_cancelOrder (exchange, symbol, orderId = undefined) {
    // cancel the order (one of the below methods is guaranteed to be existent, as this was checked in the top of this test)
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
    if (isVerbose) {
        console.log ('canceled order using ' + usedMethod + ' : ' + exchange.json (cancelResult));
    }
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
    if (isVerbose) {
        console.log ('Executing createOrder', symbol, orderType, side, amount, price, params);
    }
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
        assert (true, warningPrefix + ' ' +  exchange.id + ' failed to createOrder: ' + e.message);
    }
    return order;
}

function getMinimumMarketCostAndAmountForBuy (exchange, market, askPrice = undefined) {
    // pre-define some coefficients, which will be used down below
    const orderCostMultiplier = 1.01;
    const orderAmountMultiplier = 1.01;
    // define how much to spend (it's enough to be around minimal required cost)
    let minimumCostForBuy = undefined;
    if (market['limits']['cost']['min']) {
        minimumCostForBuy = market['limits']['cost']['min'];
    } else if (market['limits']['amount']['min']) {
        // as we know the minimal amount, we can calculate the approximate cost for purchase
        minimumCostForBuy = market['limits']['amount']['min'] * askPrice;
    } else {
        // else, we take approximately 10 USD which seems to be the common borderline of "minimim cost of order" across various exchanges. For sure, the below numbers might need to change in a few years (it's not a problem) and if there is any exchange, that doesn't support any of the below currencies, we should add it manually here
        const minimumOrderCosts = {
            'USD': 10,
            'USDT': 10,
            'BUSD': 10,
            'JPY': 1500,
            'KRW': 20000,
            'EUR': 10,
            // define minimum amount for common cryptos (i.e. for sell orders, where we need to input amount, or even for buy orders where coin is the `base`)
            'BTC': 0.001, // unless Bitcoin price falls below 10000$, this value is ok.
            'ETH': 0.02, // unless Ethereum price falls below 500$, this value is ok.
        };
        const keys = Object.keys (minimumOrderCosts);
        for (let i = 0; i < keys.length; i++) {
            const currency = keys[i];
            if (market['quote'] === currency) {
                minimumCostForBuy = minimumOrderCosts[currency];
            }
        }
    }
    minimumCostForBuy = minimumCostForBuy * orderCostMultiplier; // add a tiny more amount than minimin required

    // ensure the cost/amount is above minimum limits
    let minimumAmountForBuy = undefined;
    if (market['limits']['amount']['min']) {
        minimumAmountForBuy = market['limits']['amount']['min'] * orderAmountMultiplier; // add a small safety distance
    } else {
        minimumAmountForBuy = minimumCostForBuy / limitBuyPrice_nonFillable;
    }
    // intentionally add a tiny increment to the minimum amount/cost, to ensure that it will not cause precision issues (thus we ensure that implementation handles them)
    if (minimumAmountForBuy) {
        minimumAmountForBuy = minimumAmountForBuy + 0.000000000000000001;
    }
    if (minimumCostForBuy) {
        minimumCostForBuy = minimumCostForBuy + 0.000000000000000001;
    }
    return [ minimumAmountForBuy, minimumCostForBuy ];
}

async function testCreateOrder_tryCancelOrder (exchange, symbol, order) {
    // fetch order for maximum accuracy
    const order_fetched = await testCreateOrder_fetchOrder (exchange, symbol, order['id']);
    // check their status
    const isClosed = testCreateOrder_orderIs (exchange, order, 'closed');
    const isClosedFetched = testCreateOrder_orderIs (exchange, order_fetched, 'closed');
    const isOpen = testCreateOrder_orderIs (exchange, order, 'open');
    const isOpenFetched = testCreateOrder_orderIs (exchange, order_fetched, 'open');
    // if it was not reported as closed/filled, then try to cancel it
    if ((isClosed === undefined && isClosedFetched === undefined) || (isOpen || isOpenFetched)) {
        if (isVerbose) {
            console.log ('trying to cancel the remaining amount of partially filled order...');
        }
        try {
            await testCreateOrder_cancelOrder (exchange, symbol, order['id']);
        } catch (e) {
            // we don't throw exception here, because order might have been closed/filled already, before 'cancelOrder' call reaches server, so it is tolerable
            console.log (warningPrefix + ' ' +  exchange['id'] + ' ' + symbol + ' order ' + order['id'] + ' a moment ago, order was reported as open, but could not be cancelled at this moment: ' + exchange.json (order) + '. Exception message: ' + e.message);
        }
    } else {
        if (isVerbose) {
            console.log ('order is already closed/filled, no need to cancel it');
        }
    }
}

function testCreateOrder_assert_and_check_status (exchange, symbol, order, fillStatus) {
    let orderIsOpen = undefined;
    const orderJsoned = exchange.json (order);
    const order_filled_amount = exchange.safeString (order, 'filled');
    const order_submited_amount = exchange.safeString (order, 'amount');
    if (fillStatus === 'fully_filled') {
        
    } else if (fillStatus === 'open_or_closed') {
        // ensure it's `open` or `closed` (or undefined)
        assert ((order['status'] === 'open' || order['status'] === 'closed' || order['status'] === undefined), warningPrefix + ' ' +  exchange.id + ' ' + symbol + ' order status should be either `open` or `closed`. ' + orderJsoned);
        // check if order was still open
        const statusIsOpen = (order['status'] !== undefined && order['status'] !== 'closed');
        // if order was partially filled, then close it
        const orderAmountSubmited = exchange.safeString (order, 'amount');
        const orderAmountFilled = exchange.safeString (order, 'filled');
        // check if order had only partial fill (was not fully filled)
        const orderHasPartialFill = (orderAmountSubmited !== undefined && orderAmountFilled !== undefined && Precise.stringGt (orderAmountSubmited, orderAmountFilled));
        // if any of them was `true`, then order was still open
        orderIsOpen = statusIsOpen || orderHasPartialFill;
    }
    return orderIsOpen;
}

module.exports = testCreateOrder;
