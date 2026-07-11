import type { Str } from './../../base/types.js';
import assert from 'assert';
import { Exchange } from "../../../ccxt.js";
import testLastPrice from './base/test.lastPrice.js';
import testSharedMethods from './base/test.sharedMethods.js';
import { LastPrices } from '../../base/types.js';

async function testFetchLastPrices (exchange: Exchange, skippedProperties: object, symbol: string) {
    const method = 'fetchLastprices';
    // log ('fetching all tickers at once...')
    let response: LastPrices = {};
    let checkedSymbol: Str = undefined;
    try {
        response = await exchange.fetchLastPrices ();
    } catch (e) {
        response = await exchange.fetchLastPrices ([ symbol ]);
        checkedSymbol = symbol;
    }
    assert (exchange.isDictionary (response), exchange.id + ' ' + method + ' ' + checkedSymbol + ' must return a dict. ' + exchange.json (response));
    const values = Object.values (response);
    testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, values, checkedSymbol);
    let atLeastOnePassed = false;
    for (let i = 0; i < values.length; i++) {
        // todo: symbol check here
        testLastPrice (exchange, skippedProperties, method, values[i], checkedSymbol as string);
        atLeastOnePassed = atLeastOnePassed || ((exchange.safeNumber (values[i], 'price') as number) > 0);
    }
    assert (atLeastOnePassed, exchange.id + ' ' + method + ' ' + checkedSymbol + ' at least one symbol should pass the test');
    return true;
}

export default testFetchLastPrices;
