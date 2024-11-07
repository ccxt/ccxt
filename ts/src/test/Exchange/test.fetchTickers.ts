import assert from 'assert';
import { Exchange } from "../../../ccxt";
import testTicker from './base/test.ticker.js';
import testSharedMethods from './base/test.sharedMethods.js';

async function testFetchTickers (exchange: Exchange, skippedProperties: object, symbol: string) {
    // const withoutSymbol = testFetchTickersHelper (exchange, skippedProperties, undefined);
    // const withSymbol = testFetchTickersHelper (exchange, skippedProperties, [ symbol ]);
    await Promise.all ([ testFetchTickersHelper (exchange, skippedProperties, undefined), testFetchTickersHelper (exchange, skippedProperties, [ symbol ]) ]);
    return true;
}

async function testFetchTickersHelper (exchange: Exchange, skippedProperties: object, argSymbols, argParams = {}) {
    const method = 'fetchTickers';
    const response =  await exchange.fetchTickers (argSymbols, argParams);
    assert (typeof response === 'object', exchange.id + ' ' + method + ' ' + exchange.json (argSymbols) + ' must return an object. ' + exchange.json (response));
    const values = Object.values (response);
    let checkedSymbol = undefined;
    if (argSymbols !== undefined && argSymbols.length === 1) {
        checkedSymbol = argSymbols[0];
    }
    testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, values, checkedSymbol);
    for (let i = 0; i < values.length; i++) {
        // todo: symbol check here
        const ticker = values[i];
        testTicker (exchange, skippedProperties, method, ticker, checkedSymbol);
    }
    return true;
}

export default testFetchTickers;
