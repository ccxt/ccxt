'use strict'

// ----------------------------------------------------------------------------

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

async function testCreateOrder_getOrderWithInfo (exchange, symbol, orderType, side, amount, price, params) {
    const now = Date.now ();
    //  console.log (symbol, orderType, side, amount, price, params)

    let order = await exchange.createOrder (symbol, 'limit', 'buy', amount, price, params);
    
    // test through regular order object test
    testOrder (exchange, order, symbol, now);

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
    let minimumOrderCostForBuy = undefined;
    if (market['limits']['cost']['min']) {
        minimumOrderCostForBuy = market['limits']['cost']['min'];
    } else if (market['limits']['amount']['min']) {
        // as we know the minimal amount, we can calculate the approximate cost for purchase
        minimumOrderCostForBuy = market['limits']['amount']['min'] * askPrice;
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
                minimumOrderCostForBuy = minimumOrderCosts[currency];
            }
        }
    }
    minimumOrderCostForBuy = minimumOrderCostForBuy * orderCostMultiplier; // add a tiny more amount than minimin required

    // ensure the cost/amount is above minimum limits
    let minimumAmountForBuy = undefined;
    if (market['limits']['amount']['min']) {
        minimumAmountForBuy = market['limits']['amount']['min'] * orderAmountMultiplier; // add a small safety distance
    } else {
        minimumAmountForBuy = minimumOrderCostForBuy / limitBuyPrice_nonfillable;
    } 
    return [ minimumAmountForBuy, minimumOrderCostForBuy ];
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
    const [minimumAmountForBuy, minimumOrderCost ] = getMinimumMarketCostAndAmountForBuy (exchange, market, bestAsk);

    // ************************************ //
    // *********** [Scenario 1] *********** //
    // ************************************ //
    // create limit order which IS GUARANTEED not to be filled (far from the best bid|ask price)
    const limitBuyPrice_nonfillable = bestBid / limitPriceSafetyMultiplierFromMedian;
    const buyOrder_nonfillable = await testCreateOrder_getOrderWithInfo (exchange, symbol, 'limit', 'buy', minimumAmountForBuy, limitBuyPrice_nonfillable, {});
    const buyOrder_nonfillable_json = exchange.json (buyOrder_nonfillable);
    //
    // ensure it's open (or undefined)
    assert ((buyOrder_nonfillable['status'] === 'open' || buyOrder_nonfillable['status'] === undefined), warningPrefix + ' ' +  exchange.id + ' order status should be `open`. ' + buyOrder_nonfillable_json);
    // ensure it doesn't have any filled amount
    const buyOrder_nonfillable_filled = exchange.safeString (buyOrder_nonfillable, 'filled');
    assert (buyOrder_nonfillable_filled === undefined || Precise.stringEq (buyOrder_nonfillable_filled, '0'), warningPrefix + ' ' +  exchange.id + ' order has a fill, while it was not expected. ' + buyOrder_nonfillable_json);
    // cancel the order
    await testCreateOrder_cancelOrder (exchange, symbol, buyOrder_nonfillable.id);

    // ************************************ //
    // *********** [Scenario 2] *********** //
    // ************************************ //
    // create limit/market order which IS GUARANTEED to have a fill (full or partial), then sell the bought amount
    const limitBuyPrice_fillable = bestAsk * limitPriceSafetyMultiplierFromMedian;
    const buyOrder_fillable = await testCreateOrder_getOrderWithInfo (exchange, symbol, 'limit', 'buy', minimumAmountForBuy, limitBuyPrice_fillable, {});
    const buyOrder_fillable_json = exchange.json (buyOrder_fillable);
    //
    // ensure it's `open` or `closed` (or undefined)
    assert ((buyOrder_fillable['status'] === 'open' || buyOrder_fillable['status'] === 'closed' || buyOrder_fillable['status'] === undefined), warningPrefix + ' ' +  exchange.id + ' order status should be either `open` or `closed`. ' + buyOrder_fillable_json);
    // if order was partially filled, then close it
    const orderAmountSubmited = exchange.safeString (buyOrder_fillable, 'amount');
    const orderAmountFilled = exchange.safeString (buyOrder_fillable, 'filled');
    // check if order was still open
    const orderIsOpen = (buyOrder_fillable['status'] !== undefined && buyOrder_fillable['status'] !== 'closed');
    // check if order had only partial fill (was not fully filled)
    const orderHasPartialFill = (orderAmountSubmited !== undefined && orderAmountFilled !== undefined && Precise.stringGt (orderAmountSubmited, orderAmountFilled));
    if (orderIsOpen || orderHasPartialFill) {
        // so, if order was only partially filled & still open, then try to cancel the remaining amount
        try {
            await testCreateOrder_cancelOrder (exchange, symbol, orderId);
        } catch (e) {
            // we don't throw exception here, because it might have been cancelled/filled fully before 'cancelOrder' call reached server, so it is tolerable
            console.log (warningPrefix + ' ' +  exchange.id + ' ' + symbol + ' order ' + orderId + ' was thought to be partially filled, but could not be cancelled: ' + e.message);
        }
    }
    //
    // now, we need to sell the bought amount
    // ...


    // ***********
    // ... todo other scenarios for spot, stoploss, takeprofit, etc (not unified atm)
    // ***********
}

module.exports = testCreateOrder;
