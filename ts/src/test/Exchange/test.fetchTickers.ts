
import assert from 'assert';
import testTicker from './base/test.ticker.js';

async function testFetchTickers (exchange, skippedProperties, symbol) {
    const withoutSymbol = testFetchTickersHelper (exchange, skippedProperties, undefined);
    const withSymbol = testFetchTickersHelper (exchange, skippedProperties, [ symbol ]);
    await Promise.all ([ withSymbol, withoutSymbol ]);
}

async function testFetchTickersHelper (exchange, skippedProperties, argSymbols, argParams = {}) {
    const method = 'fetchTickers';
    const response =  await exchange.fetchTickers (argSymbols, argParams);
    assert (typeof response === 'object', exchange.id + ' ' + method + ' ' + exchange.json (argSymbols) + ' must return an object. ' + exchange.json (response));
    const values = Object.values (response);
    let checkedSymbol = undefined;
    if (argSymbols !== undefined && argSymbols.length === 1) {
        checkedSymbol = argSymbols[0];
    }
    for (let i = 0; i < values.length; i++) {
        // todo: symbol check here
        const ticker = values[i];
        testTicker (exchange, skippedProperties, method, ticker, checkedSymbol);
    }
}

export default testFetchTickers;
