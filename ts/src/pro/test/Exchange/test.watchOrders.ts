
import testOrder from '../../../test/Exchange/base/test.order.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';
import { Exchange } from '../../../../ccxt.js';

async function testWatchOrders (exchange: Exchange, skippedProperties: object, symbol: string) {
    const method = 'watchOrders';
    let now = exchange.milliseconds ();
    const ends = now + 15000;
    while (now < ends) {
        let response = undefined;
        let success = true;
        try {
            response = await exchange.watchOrders (symbol);
        } catch (e) {
            if (!testSharedMethods.isTemporaryFailure (e)) {
                throw e;
            }
            now = exchange.milliseconds ();
            // continue;
            success = false;
        }
        if (success === true) {
            testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, response, symbol);
            now = exchange.milliseconds ();
            for (let i = 0; i < response.length; i++) {
                testOrder (exchange, skippedProperties, method, response[i], symbol, now);
            }
            testSharedMethods.assertTimestampOrder (exchange, method, symbol, response);
        }
    }
    return true;
}

export default testWatchOrders;
