'use strict'

// ----------------------------------------------------------------------------

const assert = require ('assert')
    , testOrder = require ('./test.order.js')

// ----------------------------------------------------------------------------

async function testCreateOrder_getOrderWithInfo (exchange, symbol, orderType, side, amount, price, params) {
    const now = Date.now ();
    //  console.log (symbol, orderType, side, amount, price, params)

    let order = await exchange.createOrder (symbol, 'limit', 'buy', amount, price, params);
    
    // test through regular order object test
    testOrder (exchange, order, symbol, now);

    const originalId = order.id;
    
    // from `createOrder` we are not guaranteed to have reliable order-status or any information at all, so we need to fetch for order id to get more precise information
    let fetchedOrder = undefined;
    const sinceTime = Date.now () - 1000 * 60 * 60 * 24; // set 'since' to 1 day ago for safety & compatibility for all various exchanges

    // search through singular methods
    for (const singularFetchName of ['fetchOrder', 'fetchOpenOrder', 'fetchClosedOrder', 'fetchCanceledOrder']) {
        if (exchange.has[singularFetchName]) {
            try {
                const currentOrder = await exchange[singularFetchName] (originalId, symbol);
                // if there is an id inside the order, it means the order was fetched successfully
                if (currentOrder.id === originalId) {
                    fetchedOrder = currentOrder;
                    break;
                }
            } catch { }
        }
    }

    // search through plural methods
    if (fetchedOrder === undefined) {
        for (const pluralFetchName of ['fetchOrders', 'fetchOpenOrders', 'fetchClosedOrders', 'fetchCanceledOrders']) {
            if (exchange.has[pluralFetchName]) {
                try {
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
                } catch { }
            }
        }
    }

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

async function testCreateOrder(exchange, symbol) {
    const warningPrefix = ' ! ' + exchange.id + ' '; // temporary prefix for better visibility of warnings
    const method = 'createOrder';
    if (!exchange.has[method]) {
        console.log (warningPrefix, ' does not have method ', method, ' yet, skipping test...');
        return;
    }
    // skip some exchanges
    const skippedExchanges = [];
    if (skippedExchanges.includes (exchange.id)) {
        console.log (warningPrefix, 'found in ignored exchanges, skipping ' + method + ' test...');
        return;
    }
    // as this test is in it's early stages, we'd better o make a whitelist of exchanges where this will be tested reliably. After some period, we will remove the whitelist and test all exchanges
    const whitelistedExchanges = [ 'binance', 'ftx' ];
    if (!whitelistedExchanges.includes (exchange.id)) {
        console.log (warningPrefix, 'is not in whitelist for test, skipping ', method, ' test...');
        return;
    }
    // ensure it has cancel (any) method, otherwise we should refrain from automatic test.
    if (!exchange.has['cancelOrder'] && !exchange.has['cancelOrders'] && !exchange.has['cancelAllOrders']) {
        throw new Error (warningPrefix + 'does not have cancelOrder|cancelOrders|canelAllOrders method, which is needed to make tests for `createOrder` method. Skipping the test...');
        return;
    }

    const market = exchange.market (symbol);
    const now = Date.now ();

    //pre-define some coefficients, which will be used down below
    const orderCostMultiplier = 1.01; 
    const orderPriceMultiplier = 1.2;
    const orderAmountMultiplier = 1.2;

    // we need fetchBalance method to test out orders correctly
    if (!exchange.has['fetchBalance']) {
        throw new Error (warningPrefix + 'does not have fetchBalance() method, which is needed to make tests for `createOrder` method. Skipping the test...');
    }
    // ensure there is enough balance of 'quote' asset, because at first we need to 'buy' the base asset
    const balance = await exchange.fetchBalance ();
    if (balance[market['quote']]['free'] === undefined) {
        throw new Error (warningPrefix + ' does not have enough balance of' + market['quote'] + ' in fetchBalance() which is required to test ' + method);
    }

    const [bestBid, bestAsk] = testCreateOrder_getBestBidAsk ();
    if (bestBid === undefined || bestAsk === undefined) {
        throw new Error  (warningPrefix + 'could not get best bid/ask, skipping ' + method + ' test...');
    }
    // ensure values are correct
    assert ( (bestBid !== undefined) && (bestAsk !== undefined) && (bestBid > 0) || (bestAsk > 0) && (bestBid >= bestAsk), 'best bid/ask seem incorrect. Bid:' + bestBid + ' Ask:' + bestAsk);

    // define how much to spend (it's enough to be around minimal required cost)
    let approximateOrderCost = undefined;
    if (market['limits']['cost']['min']) {
        approximateOrderCost = market.limits.cost.min;
    } else {
        // else, we take approximately 10 USD which seems to be the common borderline of "minimim cost of order" across various exchanges. For sure, the below numbers might need to change in a few years (it's not a problem) and if there is any exchange, that doesn't support any of the below currencies, we should add it manually here
        const ApproximateOrderCosts = {
            'USD': 10,
            'USDT': 10,
            'BUSD': 10,
            'JPY': 1500,
            'KRW': 20000,
            'EUR': 10,
            // define minimum amount for common cryptos (i.e. for sell orders, where we need to input amount, or even for buy orders where coin is the `base`)
            'BTC': 0.001, // unless Bitcoin price falls below 10000$, this value is ok.
            'XBT': 0.001, // unless Bitcoin price falls below 10000$, this value is ok.
            'ETH': 0.02, // unless Ethereum price falls below 500$, this value is ok.
        };
        const keys = Object.keys (ApproximateOrderCosts);
        for (let i = 0; i < keys.length; i++) {
            const currency = keys[i];
            if (market.quote === currency) {
                approximateOrderCost = ApproximateOrderCosts[currency];
            }
        }
        if (approximateOrderCost === undefined) {
            throw new Error (warningPrefix + ' can not determine minimum cost of order for ' + symbol + ' market');
        }
    }
    approximateOrderCost *= orderCostMultiplier; // add a tiny more amount than minimin required

    // *********** [Scenario 1] *********** //
    // create limit order which IS GUARANTEED not to be filled (realistically far from the best bid|ask price)
    const limitBuyPrice_nonfillable = bestBid / orderPriceMultiplier;
    // as we don't have the target coins yet, we don't need the 'sell' action here, only 'buy'

    // ensure the cost/amount is now below minimum limits
    let amountToBuy_nonfillable = approximateOrderCost / limitBuyPrice_nonfillable;
    if (market.limits.amount.min) {
        amountToBuy_nonfillable = market.limits.amount.min;
        amountToBuy_nonfillable *= orderAmountMultiplier; // add a small safety distance
    }
    const buyOrder_nonfillable = await testCreateOrder_getOrderWithInfo (exchange, symbol, 'limit', 'buy', amountToBuy_nonfillable, limitBuyPrice_nonfillable, {});

    // ensure it's open (or undefined)
    assert (buyOrder_nonfillable.status === 'open' || buyOrder_nonfillable.status === undefined);

    const orderId = buyOrder_nonfillable.id;
    // cancel the order (one of the below methods is guaranteed to be existent, as this was checked in the top of this test)
    if (exchange.has['cancelOrder']) {
        await exchange.cancelOrder (orderId, symbol);
    } else if (exchange.has['cancelAllOrders']) {
        await exchange.cancelAllOrders (symbol);
    } else if (exchange.has['cancelOrders']) {
        await exchange.cancelOrders ([orderId]);
    }
    // ******* Scenario 1 - passed ******* //

    // *********** Scenario 2 *********** //
    // sell the same amount whatever was bought (otherwise, whatever available) 

    // create limit order which IS NOT GUARANTEED to have a fill (might be filled completely or partially filled or unfilled at all)
    // *********** Scenario 3 *********** //
    //  create limit/market order which IS GUARANTEED to have a fill (full or partial)
    // ... todo other scenarios for spot, stoploss, takeprofit, etc (not unified atm)

}

async function testCreateOrder_getBestBidAsk () {

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
    return [ bestBid, bestAsk ];
}

module.exports = testCreateOrder;
