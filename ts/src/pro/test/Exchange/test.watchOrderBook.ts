
import assert from 'assert';
import testOrderBook from '../../../test/Exchange/base/test.orderBook.js';
import errors from '../../../base/errors.js';

async function testWatchOrderBook (exchange, skippedProperties, symbol) {
    const method = 'watchOrderBook';
    let now = exchange.milliseconds ();
    const ends = now + exchange.wsMethodsTestTimeoutMS;
    while (now < ends) {
        try {
            const response = await exchange[method] (symbol);
            assert (typeof response === 'object', exchange.id + ' ' + method + ' ' + symbol + ' must return an object. ' + exchange.json (response));
            now = exchange.milliseconds ();
            testOrderBook (exchange, skippedProperties, method, response, symbol);
        } catch (e) {
            if (!(e instanceof errors.OperationFailed)) {
                throw e;
            }
            now = exchange.milliseconds ();
        }
    }
}

export default testWatchOrderBook;
