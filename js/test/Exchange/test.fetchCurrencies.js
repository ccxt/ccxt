'use strict'

const testCurrency = require ('./test.currency.js');

async function testFetchCurrencies (exchange) {
    const method = 'fetchCurrencies';
    const skippedExchanges = [];
    if (exchange.inArray(exchange.id, skippedExchanges)) {
        console.log (exchange.id, method, 'found in ignored exchanges, skipping ...');
        return;
    }
    const currencies = await exchange[method] ();
    // todo: try to invent something to avoid undefined undefined, i.e. maybe move into private and force it to have a value
    if (currencies !== undefined) {
        const values = exchange.values (currencies);
        for (let i = 0; i < values.length; i++) {
            testCurrency (exchange, method, values[i]);
        }
    }
}

module.exports = testFetchCurrencies;
