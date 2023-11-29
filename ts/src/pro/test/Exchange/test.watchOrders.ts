
import assert from 'assert';
import testOrder from '../../../test/Exchange/base/test.order.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';
import errors from '../../../base/errors.js';

async function testWatchOrders (exchange, skippedProperties, symbol) {
    const method = 'watchOrders';
    let now = exchange.milliseconds ();
    const ends = now + exchange.wsMethodsTestTimeoutMS;
    while (now < ends) {
        try {
            const response = await exchange[method] (symbol);
            assert (Array.isArray (response), exchange.id + ' ' + method + ' ' + symbol + ' must return an array. ' + exchange.json (response));
            now = exchange.milliseconds ();
            for (let i = 0; i < response.length; i++) {
                testOrder (exchange, skippedProperties, method, response[i], symbol, now);
            }
            testSharedMethods.assertTimestampOrder (exchange, method, symbol, response);
        } catch (e) {
            if (!(e instanceof errors.OperationFailed)) {
                throw e;
            }
            now = exchange.milliseconds ();
        }
    }
}

export default testWatchOrders;
