'use strict'

const testTradingFee = require ("./test.tradingFee")

async function testFetchTradingFees (exchange) {
    const method = 'fetchTradingFees';
    const skippedExchanges = [];
    if (exchange.inArray(exchange.id, skippedExchanges)) {
        console.log (exchange.id, method, 'found in ignored exchanges, skipping ...');
        return;
    }
    const fees = await exchange[method] ();
    const symbols = Object.keys (fees);
    for (let i = 0; i < symbols.length; i++) {
        const symbol = symbols[i];
        testTradingFee (exchange, method, symbol, fees[symbol]);
    }
    return fees;
}

module.exports = testFetchTradingFees;