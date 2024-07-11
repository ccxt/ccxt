
import assert from 'assert';
import testOrderBook from '../../../test/Exchange/base/test.orderBook.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';

async function testWatchOrderBook (exchange, skippedProperties, symbol) {
    const method = 'watchOrderBook';
    let now = exchange.milliseconds ();
    const ends = now + 15000;
    while (now < ends) {
        let response = undefined;
        try {
            response = await exchange.watchOrderBook (symbol);
        } catch (e) {
            if (!testSharedMethods.isTemporaryFailure (e)) {
                throw e;
            }
            now = exchange.milliseconds ();
            continue;
        }
        // below, `typeof .. = 'object'` turns as `is_array()` in PHP after transpilation, so to handle that
        // we need to transform the special PHP cacheTypes to normal arrays
        // todo: in future, we might edit cache classes itself
        response = exchange.parseJson (exchange.jsonWithNull (response, true));
        assert (typeof response === 'object', exchange.id + ' ' + method + ' ' + symbol + ' must return an object. ' + exchange.json (response));
        now = exchange.milliseconds ();
        testOrderBook (exchange, skippedProperties, method, response, symbol);
    }
}

export default testWatchOrderBook;
