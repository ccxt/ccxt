'use strict';

// ----------------------------------------------------------------------------

import assert from 'assert';
import errors from '../../../base/errors.js';
import testPosition from '../../../test/Exchange/base/test.position.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';

/*  ------------------------------------------------------------------------ */

export default async (exchange, symbol: string) => {

    console.log ('testing watchPositions...');

    const method = 'watchPositions';
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
            const positions = await exchange[method] ();
            assert (Array.isArray (positions), exchange.id + ' ' + method + ' must return an array, returned ' + exchange.json (positions));
            for (let i = 0; i < positions.length; i++) {
                testPosition (exchange, skippedProperties, method, positions[i], undefined, now);
            }
            testSharedMethods.assertTimestampOrder (exchange, method, undefined, positions);

            // Test with symbols
            const positionsForSymbols = await exchange[method] ([ symbol ]);
            assert (Array.isArray (positionsForSymbols), exchange.id + ' ' + method + ' must return an array, returned ' + exchange.json (positionsForSymbols));
            const positionsForSymbolLength = positionsForSymbols.length;
            assert (positionsForSymbolLength <= 4, exchange.id + ' ' + method + ' positions length for particular symbol should be less than 4, returned ' + exchange.json (positionsForSymbols));
            for (let i = 0; i < positionsForSymbols.length; i++) {
                testPosition (exchange, skippedProperties, method, positionsForSymbols[i], symbol, now);
            }
            testSharedMethods.assertTimestampOrder (exchange, method, [ symbol ], positions);

            response = positions;

        } catch (e) {

            if (!(e instanceof errors.NetworkError)) {
                throw e;
            }

            now = Date.now ();
        }
    }

    return response;
};
