'use strict'

const testTradingFee = require ('./test.tradingFee.js');

async function testFetchTradingFee (exchange, symbol) {
    const method = 'fetchTradingFee';
    const skippedExchanges = [];
    if (exchange.inArray(exchange.id, skippedExchanges)) {
        console.log (exchange.id, method, 'found in ignored exchanges, skipping ...');
        return;
    }
    const fee = await exchange[method] (symbol);
    assert (typeof fee === 'object', exchange.id + ' ' + method + ' ' + symbol + ' must return an object. ' + exchange.json (fee));
    console.log (exchange.id, method, 'fetched succesfully, asserting now.');
    testTradingFee (exchange, method, symbol, fee);
}

module.exports = testFetchTradingFee;