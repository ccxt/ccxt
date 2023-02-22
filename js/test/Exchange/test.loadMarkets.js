'use strict'

const testMarket = require ('./test.market.js')

async function testLoadMarkets (exchange) {
    const method = 'loadMarkets';
    const skippedExchanges = [];
    if (exchange.inArray(exchange.id, skippedExchanges)) {
        console.log (exchange.id, method, 'found in ignored exchanges, skipping ...');
        return;
    }
    const markets = await exchange[method] ();
    const marketValues = exchange.values (markets);
    console.log (exchange.id, method, 'fetched', marketValues.length, 'markets, asserting each ...');
    for (let i = 0; i < marketValues.length; i++) {
        testMarket (exchange, method, marketValues[i]);
    }
}

module.exports = testLoadMarkets;