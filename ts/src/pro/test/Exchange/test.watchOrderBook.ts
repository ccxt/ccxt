
import testOrderBook from '../../../test/Exchange/base/test.orderBook.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';
import { InvalidNonce } from '../../../base/errors.js';
import { Exchange } from '../../../../ccxt.js';
import type { OrderBook } from '../../../base/types.js';

async function testWatchOrderBook (exchange: Exchange, skippedProperties: object, symbol: string) {
    const method = 'watchOrderBook';
    // `watchOrderBook` only resolves when the exchange pushes an update, and a
    // pending subscription can not be cancelled from here, so every extra
    // iteration risks blocking until the test-runner kills the whole exchange.
    // a validated book is already a pass, so keep sampling only while updates
    // keep arriving quickly and stop once the book goes quiet.
    const maxIdleTime = 5000;
    let now = exchange.milliseconds ();
    const ends = now + 15000;
    let idle = false;
    while ((now < ends) && !idle) {
        let response: OrderBook | undefined = undefined;
        let success = true;
        const startTime = exchange.milliseconds ();
        try {
            response = await exchange.watchOrderBook (symbol);
        } catch (e) {
            if (!testSharedMethods.isTemporaryFailure (e) && !(e instanceof InvalidNonce)) {
                throw e;
            }
            success = false;
        }
        // refresh the deadline on every path, otherwise a stream of temporary
        // failures would loop forever
        now = exchange.milliseconds ();
        if ((success === true) && (response !== undefined)) {
            testOrderBook (exchange, skippedProperties, method, response, symbol);
            const elapsed = now - startTime;
            if (elapsed > maxIdleTime) {
                // this market updates slower than the remaining test window, so
                // awaiting another delta would only end in a harness timeout
                idle = true;
            }
        }
    }
    return true;
}

export default testWatchOrderBook;
