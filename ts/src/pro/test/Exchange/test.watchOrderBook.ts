
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
            response = await exchange[method] (symbol);
        } catch (e) {
            if (!testSharedMethods.isTemporaryFailure (e)) {
                throw e;
            }
            now = exchange.milliseconds ();
            continue;
        }
        // temp fix for php 'Pro\OrderBook' object, to turn it into array
        response['timestamp'] = exchange.safeValue(response,'timestamp');
        response = fixPhpObjectArray (exchange, response);
        assert (typeof response === 'object', exchange.id + ' ' + method + ' ' + symbol + ' must return an object. ' + exchange.json (response));
        now = exchange.milliseconds ();
        testOrderBook (exchange, skippedProperties, method, response, symbol);
    }
}

function fixPhpObjectArray (exchange, response) {
    // temp fix for php 'Pro\OrderBook' object, to turn it into array
    const result = exchange.parseJson (exchange.json (response));
    return result;
}



export default testWatchOrderBook;
