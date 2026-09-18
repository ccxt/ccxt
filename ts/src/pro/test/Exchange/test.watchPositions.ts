
import assert from 'assert';
import testPosition from '../../../test/Exchange/base/test.position.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';
import { Exchange } from '../../../../ccxt.js';

async function testWatchPositions (exchange: Exchange, skippedProperties: object, symbol: string) {
    const method = 'watchPositions';
    let now = exchange.milliseconds ();
    const ends = now + 15000;
    while (now < ends) {
        //
        // Test with specific symbol
        //
        let positionsForSymbols: any = undefined;
        let success = true;
        try {
            positionsForSymbols = await exchange.watchPositions ([ symbol ]);
        } catch (e) {
            if (!testSharedMethods.isTemporaryFailure (e)) {
                throw e;
            }
            now = exchange.milliseconds ();
            // continue;
            success = false;
        }
        if (success === true) {
            testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, positionsForSymbols, symbol);
            assert (Array.isArray (positionsForSymbols), exchange.id + ' ' + method + ' must return an array, returned ' + exchange.json (positionsForSymbols));
            // max theoretical 4 positions: two for one-way-mode and two for two-way mode
            assert (positionsForSymbols.length <= 4, exchange.id + ' ' + method + ' positions length for particular symbol should be less than 4, returned ' + exchange.json (positionsForSymbols));
            now = exchange.milliseconds ();
            for (let i = 0; i < positionsForSymbols.length; i++) {
                testPosition (exchange, skippedProperties, method, positionsForSymbols[i], symbol, now);
            }
            testSharedMethods.assertTimestampOrder (exchange, method, symbol, positionsForSymbols);
        }
    }
    return true;
}

export default testWatchPositions;
