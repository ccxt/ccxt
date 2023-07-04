'use strict';

// ----------------------------------------------------------------------------


import testOrderBook from '../../../test/Exchange/base/test.orderBook.js';
import errors from '../../../base/errors.js';

/*  ------------------------------------------------------------------------ */

export default async (exchange, symbol) => {

    // log (symbol.green, 'watching order book...')

    const method = 'watchOrderBook';
    const skippedProperties = {};

    // we have to skip some exchanges here due to the frequency of trading or to other factors
    const skippedExchanges = [
        'cex', // requires authentication
        'kucoin', // requires authentication for public orderbooks
        'luno', // requires authentication for public orderbooks
        'ripio',
        'gopax', // requires authentication for public orderbooks
        'woo',
        'alpaca', // requires auth
    ];

    if (skippedExchanges.includes (exchange.id)) {
        console.log (exchange.id, method, '() test skipped');
        return;
    }

    if (!exchange.has[method]) {
        console.log (exchange.id, 'does not support', method, '() method');
        return;
    }

    let response = undefined;

    let now = Date.now ();
    const ends = now + 10000;

    while (now < ends) {

        try {

            response = await exchange[method] (symbol);

            testOrderBook (exchange, skippedProperties, method, response, symbol);

        } catch (e) {

            if (!(e instanceof errors.NetworkError)) {
                throw e;
            }
        }

        now = Date.now ();
    }

    return response;
};
