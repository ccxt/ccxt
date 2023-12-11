'use strict';

// ----------------------------------------------------------------------------

import errors from '../../../base/errors.js';
import testPosition from '../../../test/Exchange/base/test.position.js';

/*  ------------------------------------------------------------------------ */

export default async (exchange, symbol: string) => {

    console.log ('testing watchPosition...');

    const method = 'watchPosition';
    const skippedProperties = {};

    if (!exchange.has[method]) {
        console.log (exchange.id, 'does not support', method + '() method');
        return;
    }

    let response = undefined;

    let now = Date.now ();
    const ends = now + 10000;

    while (now < ends) {

        try {

            // Test without symbol
            const position = await exchange[method] (symbol);
            testPosition (exchange, skippedProperties, method, position, symbol, now);

            response = position;

        } catch (e) {

            if (!(e instanceof errors.NetworkError)) {
                throw e;
            }

            now = Date.now ();
        }
    }

    return response;
};
