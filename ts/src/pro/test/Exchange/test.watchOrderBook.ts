
import assert from 'assert';
import testOrderBook from '../../../test/Exchange/base/test.orderBook.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';
import { Exchange } from '../../../../ccxt.js';

async function testWatchOrderBook (exchange: Exchange, skippedProperties: object, symbol: string) {
    const method = 'watchOrderBook';
    let now = exchange.milliseconds ();
    const ends = now + 15000;
    while (now < ends) {
        let response = undefined;
        let success = true;
        try {
            response = await exchange.watchOrderBook (symbol);
        } catch (e) {
            if (!testSharedMethods.isTemporaryFailure (e)) {
                throw e;
            }
            now = exchange.milliseconds ();
            // continue;
            success = false;
        }
        if (success === true) {
            now = exchange.milliseconds ();
            testOrderBook (exchange, skippedProperties, method, response, symbol);
        }
    }
    return true;
}

export default testWatchOrderBook;
