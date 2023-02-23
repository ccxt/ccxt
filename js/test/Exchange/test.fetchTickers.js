'use strict'

const assert = require ('assert');
const testTicker = require ('./test.ticker.js');

async function testFetchTickers (exchange, symbol) {
    const method = 'fetchTickers';
    const skippedExchanges = [];
    if (exchange.inArray(exchange.id, skippedExchanges)) {
        console.log (exchange.id, method, 'found in ignored exchanges, skipping ...');
        return;
    }
    // log ('fetching all tickers at once...')
    let tickers = undefined;
    let checkedSymbol = undefined;
    try {
        tickers = await exchange[method] ();
    } catch (e) {
        console.log (exchange.id, symbol, 'failed to fetch all tickers, fetching multiple tickers at once...');
        tickers = await exchange[method] ([ symbol ]);
        checkedSymbol = symbol;
    }
    assert (typeof tickers === 'object', exchange.id + ' ' + method + ' ' + checkedSymbol + ' must return an object. ' + exchange.json(tickers));
    const values = Object.values (tickers);
    console.log (exchange.id, symbol, 'fetched', values.length, 'tickers');
    for (let i = 0; i < values.length; i++) {
        const ticker = values[i];
        testTicker (exchange, method, ticker, checkedSymbol);
    }
}

module.exports = testFetchTickers;