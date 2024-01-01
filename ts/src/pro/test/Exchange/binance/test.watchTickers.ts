'use strict';

// ----------------------------------------------------------------------------

import assert from 'assert';
import log from 'ololog';
import testTicker from '../../../../test/Exchange/base/test.ticker.js';
import errors from '../../../../base/errors.js';

/*  ------------------------------------------------------------------------ */

export default async (exchange, symbol) => {

    // log (symbol.green, 'watching ticker...')

    const method = 'watchTickers';

    const tests = [
        {
            'name': 'spot default - with symbols undefined',
            'symbols': undefined,
            'params': {},
        },
        {
            'name': 'default - with empty symbols array',
            'symbols': [],
            'params': {},
        },
        {
            'name': 'swap - all symbols',
            'symbols': [],
            'params': { 'type': 'swap' },
        },
        {
            'name': 'spot ticker with one symbol',
            'symbols': [ symbol ],
            'params': { 'name': 'ticker' },
        },
        {
            'name': 'spot bookTicker with one symbol',
            'symbols': [ symbol ],
            'params': { 'name': 'bookTicker' },
        },
        {
            'name': 'swap bookTicker with one symbol',
            'symbols': [ 'BTC/USDT:USDT' ],
            'params': { 'name': 'bookTicker' },
        },
        {
            'name': 'spot ticker 1h window with one symbol',
            'symbols': [ symbol ],
            'params': { 'name': 'ticker_1h' },
        },
        {
            'name': 'spot ticker 4h window with one symbol',
            'symbols': [ symbol ],
            'params': { 'name': 'ticker_4h' },
        },
        {
            'name': 'spot ticker 1d window with one symbol',
            'symbols': [ symbol ],
            'params': { 'name': 'ticker_1d' },
        },
        {
            'name': 'spot miniticker window with one symbol',
            'symbols': [ symbol ],
            'params': { 'name': 'miniTicker' },
        },
        {
            'name': 'swap - miniticker with one symbol',
            'symbols': [ 'BTC/USDT:USDT' ],
            'params': { 'name': 'miniTicker' },
        },
        {
            'name': 'delivery - all tickers',
            'symbols': undefined,
            'params': undefined,
        },
    ];

    for (let i = 0; i < tests.length; i++) {

        const params = tests[i];

        let response = undefined;

        let now = Date.now ();
        const ends = now + 5000;

        while (now < ends) {

            try {

                response = await exchange.watchTickers (params['symbols'], params['params']);

                assert (typeof response === 'object', exchange.id + ' ' + method + ' ' + ' must return an object. ' + exchange.json (response));
                const values = Object.values (response);
                for (let ii = 0; ii < values.length; ii++) {
                    const ticker = values[ii];
                    testTicker (exchange, {}, method, ticker, ticker['symbol']);
                }

                now = Date.now ();

            } catch (e) {

                if (!(e instanceof errors.NetworkError)) {
                    log.red (exchange.id, method, params['name'], 'FAILED', e);
                    throw e;
                }

                log.yellow (exchange.id, method, params['name'], 'NetworkError', e);
                now = Date.now ();
                break;
            }

        }

        await exchange.close ();

        log.green (exchange.id, method, params['name'], 'OK');

    }
    return true;
};
