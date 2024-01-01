
import assert from 'assert';
import testTicker from './base/test.ticker.js';

async function testFetchTickers (exchange, skippedProperties, symbol) {
    const withoutSymbol = testFetchTickersHelper (exchange, skippedProperties, undefined);
    const withSymbol = testFetchTickersHelper (exchange, skippedProperties, [ symbol ]);
    await Promise.all ([ withSymbol, withoutSymbol ]);
}

async function testFetchTickersHelper (exchange, skippedProperties, argSymbols, argParams = {}) {
    const method = 'fetchTickers';
    // log ('fetching all tickers at once...')
    let tickers = undefined;
    let checkedSymbol = undefined;
    try {
        tickers = await exchange.fetchTickers (argSymbols, argParams);
    } catch (e) {
        tickers = await exchange.fetchTickers ([ symbol ]);
        checkedSymbol = symbol;
    }
    assert (typeof tickers === 'object', exchange.id + ' ' + method + ' ' + checkedSymbol + ' must return an object. ' + exchange.json (tickers));
    const values = Object.values (tickers);
    for (let i = 0; i < values.length; i++) {
        const ticker = values[i];
        testTicker (exchange, skippedProperties, method, ticker, checkedSymbol);
    }
}

export default testFetchTickers;
