'use strict'

// ----------------------------------------------------------------------------

import log from 'ololog';

import testTicker from '../../../test/Exchange/test.ticker.js';
import errors from '../../../base/errors.js';

/*  ------------------------------------------------------------------------ */

export default async (exchange, symbol) => {

    // log (symbol.green, 'watching ticker...')

    const method = 'watchTicker'

    // we have to skip some exchanges here due to the frequency of trading
    const skippedExchanges = [
        'cex',
        'ripio',
        'mexc',
        'woo'
    ]

    if (skippedExchanges.includes (exchange.id)) {
        log (exchange.id, method + '() test skipped')
        return
    }

    if (!exchange.has[method]) {
        log (exchange.id, method + '() is not supported')
        return
    }

    let response = undefined

    let now = Date.now ()
    const ends = now + 10000

    while (now < ends) {

        try {

            response = await exchange[method] (symbol)

            testTicker (exchange, response, method, symbol)

            now = Date.now ()

        } catch (e) {

            if (!(e instanceof errors.NetworkError)) {
                throw e
            }

            now = Date.now ()
        }

    }

    return response
};
