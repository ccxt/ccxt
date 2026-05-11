
// AUTO-TRANSPILE //

'use strict';

import asTable from 'as-table';
import log from 'ololog';
import ansi from 'ansicolor';
import ccxt from '../../js/ccxt.js';

ansi.nice; // eslint-disable-line no-unused-expressions

// @ts-expect-error
log.nice = log.configure ({ locate: false, stringify: asTable.configure ({ print: x => x }) }); // eslint-disable-line

console.log ('CCXT Version:', ccxt.version);

async function test () {
    let total = 0;
    let missing = 0;
    let implemented = 0;
    let emulated = 0;

    const exchanges = ccxt.exchanges
        .map ((id) => new ccxt[id] ())
        .filter ((exchange) => exchange.has.ws);

    log (
        asTable (
            exchanges
                .map ((exchange) => {
                    const result = {};
                    [
                        'ws',
                        'watchOrderBook',
                        'watchTicker',
                        'watchTrades',
                        'watchOHLCV',
                        'watchBalance',
                        'watchOrders',
                        'watchMyTrades',
                    ].forEach ((key) => {
                        total += 1;
                        let capability = (key in exchange.has) ? exchange.has[key].toString () : 'undefined';
                        if (!exchange.has[key]) {
                            capability = exchange.id.red.dim;
                            missing += 1;
                        } else if (exchange.has[key] === 'emulated') {
                            capability = exchange.id.yellow;
                            emulated += 1;
                        } else {
                            capability = exchange.id.green;
                            implemented += 1;
                        }

                        result[key] = capability;
                    });
                    return result;
                })
        )
    );

    log (
        'Summary:',
        // @ts-expect-error
        exchanges.length.toString ().green, 'exchanges,', // eslint-disable-line
        // @ts-expect-error
        implemented.toString ().green, 'methods implemented,', // eslint-disable-line
        // @ts-expect-error
        emulated.toString ().yellow, 'emulated,', // eslint-disable-line
        // @ts-expect-error
        missing.toString ().red, 'missing,', // eslint-disable-line
        total.toString (), 'total') // eslint-disable-line

}

test ();
