'use strict';

// ----------------------------------------------------------------------------

import assert from 'assert';
import testTicker from '../../../test/Exchange/base/test.ticker.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';
import errors from '../../../base/errors.js';

/*  ------------------------------------------------------------------------ */

export default async (exchange, symbols) => {

    const method = 'watchTickers';
    const skippedProperties = {};

    // we have to skip some exchanges here due to the frequency of trading
    const skippedExchanges = [
        'cex',
        'ripio',
        'mexc',
        'woo',
        'krakenfutures', // requires fixing
        'poloniex', // requires fixing
        'alpaca', // requires auth
    ];

    if (skippedExchanges.includes (exchange.id)) {
        console.log (exchange.id, method + '() test skipped');
        return;
    }

    if (!exchange.has[method]) {
        console.log (exchange.id, method + '() is not supported');
        return;
    }

    let now = Date.now ();
    const ends = now + 10000;

    let response = undefined;

    while (now < ends) {

        try {
            response = await exchange[method] (symbols);
            assert (typeof response === 'object', exchange.id + ' ' + method + ' ' + ' must return an object. ' + exchange.json (response));

            const keys = Object.keys (response);
            const logText = testSharedMethods.logTemplate (exchange, method, symbols);
            for (let i = 0; i < keys.length; i++) {
                const symbol = keys[i];
                if (symbols !== undefined) {
                    const stingifiedArrayValue = exchange.json (symbols); // don't use expectedArray.join (','), as it bugs in other languages, if values are bool, undefined or etc..
                    assert (exchange.inArray (symbol, symbols),  '"  symbol "' + symbol + '" is not in the symbols list : [' + stingifiedArrayValue + ']' + logText);
                }
                const ticker = exchange.safeValue (response, symbol);
                testTicker (exchange, skippedProperties, method, ticker, symbol);
            }

            now = Date.now ();

        } catch (e) {

            if (!(e instanceof errors.NetworkError)) {
                throw e;
            }

            now = Date.now ();
        }

    }

    return response;
};
