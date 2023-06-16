'use strict';

// ----------------------------------------------------------------------------

import assert from 'assert';
import testTrade from '../../../test/Exchange/base/test.trade.js';
import errors from '../../../base/errors.js';

/*  ------------------------------------------------------------------------ */

export default async (exchange, symbol) => {

    // log (symbol.green, 'watching trades...')

    const method = 'watchTrades';
    const skippedProperties = {};

    // we have to skip some exchanges here due to the frequency of trading
    const skippedExchanges = [
        'binanceje',
        'bitvavo',
        'currencycom',
        'dsx',
        'idex2', // rinkeby testnet, trades too rare
        'luno', // requires authentication for public trades
        'ripio',
        'zipmex',
        'coinflex', // to illiquid
        'woo',
        'independentreserve',
    ];

    if (skippedExchanges.includes (exchange.id)) {
        console.log (exchange.id, method + '() test skipped');
        return;
    }

    if (!exchange.has[method]) {
        console.log (exchange.id, 'does not support', method + '() method');
        return;
    }

    let response = undefined;

    let now = Date.now ();
    const ends = now + 10000;

    while (now < ends) {

        try {

            response = await exchange[method] (symbol);

            now = Date.now ();

            assert (response instanceof Array);

            console.log (exchange.iso8601 (now), exchange.id, symbol, method, Object.values (response).length, 'trades');

            // log.noLocate (asTable (response))

            for (let i = 0; i < response.length; i++) {
                testTrade (exchange, skippedProperties, method, response[i], symbol, now);
            }
        } catch (e) {

            if (!(e instanceof errors.NetworkError)) {
                throw e;
            }

            now = Date.now ();
        }
    }

    return response;
};
