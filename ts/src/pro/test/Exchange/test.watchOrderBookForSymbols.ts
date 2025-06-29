
import assert from 'assert';
import testOrderBook from '../../../test/Exchange/base/test.orderBook.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';
import { InvalidNonce } from '../../../base/errors.js';
import { Exchange } from '../../../../ccxt.js';

async function testWatchOrderBookForSymbols (exchange: Exchange, skippedProperties: object, symbols: string[]) {
    const method = 'watchOrderBookForSymbols';
    let now = exchange.milliseconds ();
    const ends = now + 15000;
    while (now < ends) {
        let response = undefined;
        try {
            response = await exchange.watchOrderBookForSymbols (symbols);
        } catch (e) {
            // temporary fix for InvalidNonce for c#
            if (!testSharedMethods.isTemporaryFailure (e) && !(e instanceof InvalidNonce)) {
                throw e;
            }
            now = exchange.milliseconds ();
            continue;
        }
        // [ response, skippedProperties ] = fixPhpObjectArray (exchange, response, skippedProperties);
        response = exchange.orderbookToDict (response);
        assert (typeof response === 'object', exchange.id + ' ' + method + ' ' + exchange.json (symbols) + ' must return an object. ' + exchange.json (response));
        now = exchange.milliseconds ();
        testSharedMethods.assertInArray (exchange, skippedProperties, method, response, 'symbol', symbols);
        testOrderBook (exchange, skippedProperties, method, response, undefined);
    }
}

export default testWatchOrderBookForSymbols;
