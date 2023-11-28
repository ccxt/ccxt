'use strict';

// ----------------------------------------------------------------------------

import errors from '../../../base/errors.js';
import testPosition from '../../../test/Exchange/base/test.position.js';

/*  ------------------------------------------------------------------------ */

async function testWatchPosition (exchange, skippedProperties, symbol) {

    console.log ('testing watchPosition...');

    const method = 'watchPosition';

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
}

export default testWatchPosition;
