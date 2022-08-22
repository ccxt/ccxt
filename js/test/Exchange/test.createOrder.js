'use strict'

// ----------------------------------------------------------------------------

const assert = require ('assert')
    , testOrder = require ('./test.order.js')

// ----------------------------------------------------------------------------

async function getOrderWithInfo (exchange, symbol, orderType, side, amount, price, params) {
    const now = Date.now ()
    //  console.log (symbol, orderType, side, amount, price, params)

    let order = await exchange.createOrder (symbol, 'limit', 'buy', amount, price, params);
    
    // test through regular order object test
    testOrder (exchange, order, symbol, now)

    const originalId = order.id
    
    // from `createOrder` we are not guaranteed to have reliable order-status or any information at all, so we need to fetch for order id to get more precise information
    let fetchedOrder = undefined
    const sinceTime = Date.now () - 1000 * 60 * 60 * 24 // set 'since' to 1 day ago for safety & compatibility for all various exchanges

    // search through singular methods
    for (const singularFetchName of ['fetchOrder', 'fetchOpenOrder', 'fetchClosedOrder', 'fetchCanceledOrder']) {
        if (exchange.has[singularFetchName]) {
            try {
                const currentOrder = await exchange[singularFetchName] (originalId, symbol)
                // if there is an id inside the order, it means the order was fetched successfully
                if (currentOrder.id === originalId) {
                    fetchedOrder = currentOrder
                    break
                }
            } catch { }
        }
    }

    // search through plural methods
    if (fetchedOrder === undefined) {
        for (const pluralFetchName of ['fetchOrders', 'fetchOpenOrders', 'fetchClosedOrders', 'fetchCanceledOrders']) {
            if (exchange.has[pluralFetchName]) {
                try {
                    const orders = await exchange[pluralFetchName] (symbol, sinceTime)
                    let found = false;
                    for (let i = 0; i < orders.length; i++) {
                        const currentOrder = orders[i]
                        if (currentOrder.id === originalId) {
                            fetchedOrder = currentOrder
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
        console.log ('Abnormal error: order was not fetched. This exchange-test might be missing some information. So, test this current test might not be fully reliable')
    } else {
        // for maximal informativeness, extend original order-info with fetched order-info
        if (fetchedOrder !== undefined) {
            order = exchange.deepExtend (order, fetchedOrder)
        }
    }
    return order;
}

module.exports = async (exchange, symbol) => {

    const method = 'createOrder'

    const skippedExchanges = []

    if (skippedExchanges.includes (exchange.id)) {
        console.log (exchange.id, 'found in ignored exchanges, skipping ' + method + '...')
        return
    }

    if (exchange.has[method]) {

        if (!exchange.has['cancelOrder'] && !exchange.has['cancelAllOrders'] && !exchange.has['cancelOrders']) {
            console.log (exchange.id, "does not have cancelOrder() method, which is needed to test 'createOrder' method. Skipping...")
            return
        }

        const market = exchange.market (symbol)
        const now = Date.now ()

        //pre-define some coefficients, which will be used down below
        const orderCostMultiplier = 1.1; 
        const orderPriceMultiplier = 1.2;
        const orderAmountMultiplier = 1.2;

        // we need fetchBalance method to test out orders correctly
        if (!exchange.has['fetchBalance']) {
            console.log (exchange.id + " does not have fetchBalance() which is important to test 'createOrder'. So, test this current test might not be fully reliable")
        } else {
            // ensure there is enough balance of 'quote' asset, because at first we need to 'buy' the base asset
            const balance = await exchange.fetchBalance ()
            if (balance[market['quote']]['free'] === undefined) {
                throw new Error (exchange.id + ' does not have fee ' + market['quote'] + ' in fetchBalance() which is required to test ' + method)
            }
        }

        // find out best bid/ask price to determine the entry prices
        let bestBid = undefined
        let bestAsk = undefined

        if (exchange.has['fetchOrderBook']) {
            const orderbook = await exchange.fetchOrderBook (symbol)
            bestBid = orderbook.bids[0][0]
            bestAsk = orderbook.asks[0][0]
        } else if (exchange.has['fetchTicker']) {
            const ticker = await exchange.fetchTicker (symbol)
            bestBid = ticker.bid
            bestAsk = ticker.ask
        } else if (exchange.has['fetchTickers']) {
            const tickers = await exchange.fetchTickers ([symbol])
            bestBid = tickers[symbol].bid
            bestAsk = tickers[symbol].ask
        } else if (exchange.has['fetchL1OrderBooks']) {
            const tickers = await exchange.fetchL1OrderBooks ([symbol])
            bestBid = tickers[symbol].bid
            bestAsk = tickers[symbol].ask
        } else if (exchange.has['fetchBidsAsks']) {
            const tickers = await exchange.fetchBidsAsks ([symbol])
            bestBid = tickers[symbol].bid
            bestAsk = tickers[symbol].ask
        } else {
            throw new Error (exchange.id + ' does not have any method to get symbol price')
        }
        
        // ensure values are correct
        assert ( (bestBid !== undefined) && (bestAsk !== undefined) && (bestBid > 0) || (bestAsk > 0) && (bestBid >= bestAsk), 'best bid/ask seem incorrect. Bid:'+ bestBid + " Ask:" + bestAsk)

        // define how much to spend (it's 'enough to be around minimal required cost)
        let approximateOrderCost = undefined
        if (market.limits.cost.min) {
            approximateOrderCost = market.limits.cost.min;
        } else {
            // else, we take approximately 10 USD which seems to be the common maximum of "minimim cost of order" across various exchanges. For sure, these numbers might need to change in a few years and it's not a problem
            if (market.quote.indexOf('USD') > -1) {
                approximateOrderCost = 10;
            } else if ( market.quote === 'JPY') {
                approximateOrderCost = 1500; //
            } else if ( market.quote === 'KRW') {
                approximateOrderCost = 20000; //
            } else if ( market.quote === 'EUR') {
                approximateOrderCost = 10; //
            } else {
                throw new Error (exchange.id + ' can not determine minimum cost of order')
            }
        }
        approximateOrderCost *= orderCostMultiplier; // add a small amount for safety

        // ********************************** //
        // Now we need to test out three different scenarions:
        // 1) create limit order which will be guaranteed not to be executed (i.e. far from the median price)
        // 2) create limit order which is not clear will be filled or not
        // 3) create limit/market order which is supposed to be filled completely
        // ********************************** //
        
        // *********** Scenario 1 *********** //
        // set the limit prices, which are slighly beyond the best bid/ask
        const limitBuyPrice_nonfillable = bestBid / orderPriceMultiplier;
        // as we don't have the target coins yet, we don't need the 'sell' action here, only 'buy'

        // ensure the cost/amount is now below minimum limits
        let amountToBuy_nonfillable = approximateOrderCost / limitBuyPrice_nonfillable;
        if (market.limits.amount.min) {
            amountToBuy_nonfillable = market.limits.amount.min;
            amountToBuy_nonfillable *= orderAmountMultiplier; // add a small safety distance
        }
        const buyOrder_nonfillable = await getOrderWithInfo (exchange, symbol, 'limit', 'buy', amountToBuy_nonfillable, limitBuyPrice_nonfillable, {})

        // ensure it's open (or undefined)
        assert (buyOrder_nonfillable.status === 'open' || buyOrder_nonfillable.status === undefined)

        const orderId = buyOrder_nonfillable.id;
        // cancel the order
        if (exchange.has['cancelOrder']) {
            await exchange.cancelOrder (orderId, symbol)
        } else if (exchange.has['cancelAllOrders']) {
            await exchange.cancelAllOrders (symbol)
        } else if (exchange.has['cancelOrders']) {
            await exchange.cancelOrders ([orderId])
        } // one of the above methods should be existent, as it's checked when starting this test
        // ******* Scenario 1 - passed ******* //

        // *********** Scenario 2 *********** //
        // sell the same amount whatever was bought (otherwise, whatever available)

    } else {

        console.log (symbol, method + '() is not supported')
    }
}
