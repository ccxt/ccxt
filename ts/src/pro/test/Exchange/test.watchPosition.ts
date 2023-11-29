
import assert from 'assert';
import testPosition from '../../../test/Exchange/base/test.position.js';
import errors from '../../../base/errors.js';

async function testWatchPosition (exchange, skippedProperties, symbol) {
    const method = 'watchPosition';
    let now = exchange.milliseconds ();
    const ends = now + exchange.wsMethodsTestTimeoutMS;
    while (now < ends) {
        try {
            const response = await exchange[method] (symbol);
            assert (typeof response === 'object', exchange.id + ' ' + method + ' ' + symbol + ' must return an object. ' + exchange.json (response));
            now = exchange.milliseconds ();
            testPosition (exchange, skippedProperties, method, response, undefined, now);
        } catch (e) {
            if (!(e instanceof errors.OperationFailed)) {
                throw e;
            }
            now = exchange.milliseconds ();
        }
    }
}

export default testWatchPosition;
