
import assert from 'assert';
import testTicker from '../../../test/Exchange/base/test.ticker.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';
import { ArgumentsRequired } from '../../../base/errors.js';

async function testWatchTickers (exchange, skippedProperties, symbol) {
    const withoutSymbol = testWatchTickersHelper (exchange, skippedProperties, undefined);
    const withSymbol = testWatchTickersHelper (exchange, skippedProperties, [ symbol ]);
    await Promise.all ([ withSymbol, withoutSymbol ]);
}

async function testWatchTickersHelper (exchange, skippedProperties, argSymbols, argParams = {}) {
    const method = 'watchTickers';
    let now = exchange.milliseconds ();
    const ends = now + 15000;
    while (now < ends) {
        let response = undefined;
        try {
            response = await exchange.watchTickers (argSymbols, argParams);
        } catch (e) {
            // for some exchanges, specifically watchTickers method not subscribe
            // to "all tickers" itself, and it requires symbols to be set
            // so, in such case, if it's arguments-required exception, we don't
            // mark tests as failed, but just skip them
            if ((e instanceof ArgumentsRequired) && (argSymbols === undefined || argSymbols.length === 0)) {
                // todo: provide random symbols to try
                return;
            }
            else if (!testSharedMethods.isTemporaryFailure (e)) {
                throw e;
            }
            now = exchange.milliseconds ();
            continue;
        }
        assert (typeof response === 'object', exchange.id + ' ' + method + ' ' + exchange.json (argSymbols) + ' must return an object. ' + exchange.json (response));
        const values = Object.values (response);
        let checkedSymbol = undefined;
        if (argSymbols !== undefined && argSymbols.length === 1) {
            checkedSymbol = argSymbols[0];
        }
        for (let i = 0; i < values.length; i++) {
            const ticker = values[i];
            testTicker (exchange, skippedProperties, method, ticker, checkedSymbol);
        }
        now = exchange.milliseconds ();
    }
}

export default testWatchTickers;
