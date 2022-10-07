'use strict'

// ----------------------------------------------------------------------------

const ccxt = require ('../../../ccxt.js');
const assert = require ('assert');
const testOrder = require ('./test.order.js');
const Precise = require ('../../base/Precise');
const warningPrefix = ' ! '; // temporary prefix for better visibility of warnings
// ----------------------------------------------------------------------------

async function testCreateOrder_fetchOrder (exchange, symbol, orderId) {
    let fetchedOrder = undefined;
    let originalId = orderId;
    // set 'since' to 1 day ago for safety & compatibility for all various exchanges
    const sinceTime = Date.now () - 1000 * 60 * 60 * 24; 
    //
    // search through singular methods
    for (const singularFetchName of ['fetchOrder', 'fetchOpenOrder', 'fetchClosedOrder', 'fetchCanceledOrder']) {
        if (exchange.has[singularFetchName]) {
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
    return fetchedOrder;
}

async function testCreateOrder_cancelOrder (exchange, symbol, orderId) {
    // cancel the order (one of the below methods is guaranteed to be existent, as this was checked in the top of this test)
    if (exchange.has['cancelOrder']) {
        await exchange.cancelOrder (orderId, symbol);
    } else if (exchange.has['cancelAllOrders']) {
        await exchange.cancelAllOrders (symbol);
    } else if (exchange.has['cancelOrders']) {
        await exchange.cancelOrders ([orderId]);
    }
}

async function testCreateOrder_getBestBidAsk (exchange, symbol) {
    // find out best bid/ask price to determine the entry prices
    let bestBid = undefined;
    let bestAsk = undefined;

    if (exchange.has['fetchOrderBook']) {
        const orderbook = await exchange.fetchOrderBook (symbol);
        bestBid = orderbook.bids[0][0];
        bestAsk = orderbook.asks[0][0];
    } else if (exchange.has['fetchTicker']) {
        const ticker = await exchange.fetchTicker (symbol);
        bestBid = ticker.bid;
        bestAsk = ticker.ask;
    } else if (exchange.has['fetchTickers']) {
        const tickers = await exchange.fetchTickers ([symbol]);
        bestBid = tickers[symbol].bid;
        bestAsk = tickers[symbol].ask;
    } else if (exchange.has['fetchL1OrderBooks']) {
        const tickers = await exchange.fetchL1OrderBooks ([symbol]);
        bestBid = tickers[symbol].bid;
        bestAsk = tickers[symbol].ask;
    } else if (exchange.has['fetchBidsAsks']) {
        const tickers = await exchange.fetchBidsAsks ([symbol]);
        bestBid = tickers[symbol].bid;
        bestAsk = tickers[symbol].ask;
    }
    //
    if (bestBid === undefined || bestAsk === undefined) {
        throw new Error  (warningPrefix + ' ' +  exchange.id + ' could not get best bid/ask, skipping ' + method + ' test...');
    }
    // ensure values are correct
    assert ( (bestBid !== undefined) && (bestAsk !== undefined) && (bestBid > 0) || (bestAsk > 0) && (bestBid >= bestAsk), warningPrefix + ' ' +  exchange.id + ' best bid/ask seem incorrect. Bid:' + bestBid + ' Ask:' + bestAsk);
    return [ bestBid, bestAsk ];
}

async function testCreateOrder_getOrderWithInfo (exchange, symbol, orderType, side, amount, price = undefined, params = {}) {
    //  console.log (symbol, orderType, side, amount, price, params)
    let order = await exchange.createOrder (symbol, orderType, side, amount, price, params);
    // test through regular order object test
    testOrder (exchange, order, symbol, Date.now ());
    // ensure it has an ID
    assert (order.id !== undefined, warningPrefix + ' ' +  exchange.id + ' order should have an id. ' + exchange.json (order));
    const originalId = order.id;
    // from `createOrder` we are not guaranteed to have reliable order-status or any information at all, so we need to fetch for order id to get more precise information
    const fetchedOrder = await testCreateOrder_fetchOrder (exchange, symbol, originalId);
    if (fetchedOrder === undefined) {
        throw new Error ('Abnormal error: order was not fetched. This exchange-test might be missing some information, thus this current test might not be fully reliable');
    } else {
        // for maximal informativeness, extend original order-info with fetched order-info
        if (fetchedOrder !== undefined) {
            order = exchange.deepExtend (order, fetchedOrder);
        }
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
        minimumAmountForBuy = minimumCostForBuy / limitBuyPrice_nonfillable;
    } 
    return [ minimumAmountForBuy, minimumCostForBuy ];
}

function testCreateOrder_assert_and_check_status (exchange, symbol, order, fillStatus) {
    let orderIsOpen = undefined;
    const orderJsoned = exchange.json (order);
    const order_filled_amount = exchange.safeString (order, 'filled');
    const order_submited_amount = exchange.safeString (order, 'amount');
    if (fillStatus === 'unfilled') {
        // ensure it's open (or undefined)
        assert ((order['status'] === 'open' || order['status'] === undefined), warningPrefix + ' ' +  exchange.id + ' order status should be `open`. ' + orderJsoned);
        // ensure it doesn't have any filled amount
        assert (order_filled_amount === undefined || Precise.stringEq (order_filled_amount, '0'), warningPrefix + ' ' +  exchange.id + ' order has a fill, while it was not expected. ' + orderJsoned);
    } else if (fillStatus === 'fully_filled') {
        // ensure that order has `closed` status
        assert (order['status'] === 'closed' || order['status'] === undefined, warningPrefix + ' ' +  exchange.id + ' ' + symbol + ' order status should be `closed`. ' + orderJsoned);
        // ensure that `filled` amount is equal to `amount`
        assert (order_filled_amount === undefined || order_submited_amount === undefined || Precise.stringEq (order_filled_amount, order_submited_amount), warningPrefix + ' ' +  exchange.id + ' order `filled` amount should be equal to `amount`. ' + orderJsoned);
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
        throw new Error (warningPrefix + ' ' +  exchange.id + ' does not have cancelOrder|cancelOrders|canelAllOrders method, which is needed to make tests for `createOrder` method. Skipping the test...');
        return;
    }

    const limitPriceSafetyMultiplierFromMedian = 1.2;
    const market = exchange.market (symbol);
    const now = Date.now ();

    // we need fetchBalance method to test out orders correctly
    if (!exchange.has['fetchBalance']) {
        throw new Error (warningPrefix + ' ' +  exchange.id + ' does not have fetchBalance() method, which is needed to make tests for `createOrder` method. Skipping the test...');
    }
    // ensure there is enough balance of 'quote' asset, because at first we need to 'buy' the base asset
    const balance = await exchange.fetchBalance ();
    if (balance[market['quote']]['free'] === undefined) {
        throw new Error (warningPrefix + ' ' +  exchange.id + ' does not have enough balance of' + market['quote'] + ' in fetchBalance() which is required to test ' + method);
    }

    const [bestBid, bestAsk] = await testCreateOrder_getBestBidAsk (exchange, symbol);
    let [minimumAmountForBuy, minimumCostForBuy ] = getMinimumMarketCostAndAmountForBuy (exchange, market, bestAsk);

    if (minimumAmountForBuy === undefined || minimumCostForBuy === undefined) {
        throw new Error (warningPrefix + ' ' +  exchange.id + ' can not determine minimum amount/cost of order for ' + symbol + ' market');
    }

    // ************************************ //
    // *********** [Scenario 1] *********** //
    // ************************************ //
    // create limit order which IS GUARANTEED not to be filled (far from the best bid|ask price)
    const limitBuyPrice_nonfillable = bestBid / limitPriceSafetyMultiplierFromMedian;
    const buyOrder_nonfillable = await testCreateOrder_getOrderWithInfo (exchange, symbol, 'limit', 'buy', minimumAmountForBuy, limitBuyPrice_nonfillable, {});
    testCreateOrder_assert_and_check_status (exchange, symbol, buyOrder_nonfillable, 'unfilled');
    // cancel the order
    await testCreateOrder_cancelOrder (exchange, symbol, buyOrder_nonfillable.id);
    // *********** [Scenario 1 - END ] *********** //


    // ************************************ //
    // *********** [Scenario 2] *********** //
    // ************************************ //
    // create limit/market order which IS GUARANTEED to have a fill (full or partial), then sell the bought amount
    const limitBuyPrice_fillable = bestAsk * limitPriceSafetyMultiplierFromMedian;
    const buyOrder_fillable = await testCreateOrder_getOrderWithInfo (exchange, symbol, 'limit', 'buy', minimumAmountForBuy, limitBuyPrice_fillable, {});
    const buyOrder_fillable_isOpen = testCreateOrder_assert_and_check_status (exchange, symbol, buyOrder_fillable, 'open_or_closed');
    if (buyOrder_fillable_isOpen) {
        // so, if order was only partially filled & still open, then try to cancel the remaining amount
        try {
            await testCreateOrder_cancelOrder (exchange, symbol, buyOrder_fillable['id']);
        } catch (e) {
            // we don't throw exception here, because it might have been cancelled/filled fully before 'cancelOrder' call reached server, so it is tolerable
            console.log (warningPrefix + ' ' +  exchange.id + ' ' + symbol + ' order ' + buyOrder_fillable['id'] + ' was thought to be partially filled, but could not be cancelled: ' + e.message);
        }
    }
    //
    // now, we need to sell the bought amount
    try {
        // at first, try to sell the 'whole' amount that was submited (independent from the fact, whether above we have only 'partial fill' indications or not, because in this last second, even the partially filled order could have been fully filled)
        const sellOrder = await testCreateOrder_getOrderWithInfo (exchange, symbol, 'market', 'sell', minimumAmountForBuy, undefined, {'reduceOnly': true}); // we use 'reduceOnly' to ensure we don't open a margin-ed position accidentally
        // try to test that order was fully filled
        testCreateOrder_assert_and_check_status (exchange, symbol, sellOrder, 'fully_filled');
    } catch (e) {
        if (e instanceof ccxt.InsufficientFunds) {
            console.log (warningPrefix + ' ' +  exchange.id + ' ' + symbol + ' : tried to sell the ordered buy amount fully, however faced an error' + e.message + '; now, we will try to sell only reported bought amount exactly');
            try {
                let reported_filled_amount = buyOrder_fillable['filled'];
                if (!reported_filled_amount) {
                    // if it was not reported, then the last step is to re-fetch balance and sell all target tokens (don't worry, it will not sell much, as the test reached here, it means that even the minimum sell amount execution had failed because of insufficient coins, so, all this will sell is whatever small amount exists in wallet)
                    const balance = await exchange.fetchBalance ();
                    reported_filled_amount = balance[market['base']]['free'];
                }
                const sellOrderRepeated = await testCreateOrder_getOrderWithInfo (exchange, symbol, 'market', 'sell', reported_filled_amount, undefined, {'reduceOnly': true}); // we use 'reduceOnly' to ensure we don't open a margin-ed position accidentally
                // try to test that order was fully filled
                testCreateOrder_assert_and_check_status (exchange, symbol, sellOrderRepeated, 'fully_filled');
            } catch (innerException) { 
                console.log (warningPrefix + ' ' +  exchange.id + ' ' + symbol + ' : experienced unexpected error while making repeated sell order: ' + e.message);
            }
        } else {
            console.log (warningPrefix + ' ' +  exchange.id + ' ' + symbol + ' : experienced unexpected error: ' + e.message);
        }
    }
    // *********** [Scenario 2 - END ] *********** //


    // ***********
    // above, we already tested 'limit' and 'market' orders. next, 'todo' is to create tests for other unified scenarios (spot, swap, trigger, positions, stoploss, takeprofit, etc)
    // ***********
}

module.exports = testCreateOrder;
