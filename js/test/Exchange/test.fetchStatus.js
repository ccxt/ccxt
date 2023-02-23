'use strict'

const testStatus = require ('./test.status.js');

async function testFetchStatus (exchange) {
    const method = 'fetchStatus';
    const skippedExchanges = [];
    if (exchange.inArray(exchange.id, skippedExchanges)) {
        console.log (exchange.id, method, 'found in ignored exchanges, skipping ...');
        return;
    }
    const status = await exchange[method] ();
    console.log (exchange.id, method, 'fetched succesfully, asserting now ...');
    testStatus (exchange, method, status, exchange.milliseconds ());
}

module.exports = testFetchStatus;