
import assert from 'assert';
import testTicker from '../../../test/Exchange/base/test.ticker.js';
import errors from '../../../base/errors.js';

async function testWatchTicker (exchange, skippedProperties, symbol) {
    const method = 'watchTicker';
    let now = exchange.milliseconds ();
    const ends = now + exchange.wsMethodsTestTimeoutMS;
    while (now < ends) {
        try {
            const response = await exchange[method] (symbol);
            assert (typeof response === 'object', exchange.id + ' ' + method + ' ' + symbol + ' must return an object. ' + exchange.json (response));
            now = exchange.milliseconds ();
            testTicker (exchange, skippedProperties, method, response, symbol);
        } catch (e) {
            if (!(e instanceof errors.OperationFailed)) {
                throw e;
            }
            now = exchange.milliseconds ();
        }
    }
}

export default testWatchTicker;
