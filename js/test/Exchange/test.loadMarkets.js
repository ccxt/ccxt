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
    const keys = Object.keys (markets);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const market = markets[key];
        testMarket (exchange, method, market);
    }
    return markets;
}

module.exports = testLoadMarkets;