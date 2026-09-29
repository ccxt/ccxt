
import testOrderBook from '../../../test/Exchange/base/test.orderBook.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';
import { InvalidNonce } from '../../../base/errors.js';
import { Exchange, OrderBook } from '../../../../ccxt.js';

async function testWatchOrderBookForSymbols (exchange: Exchange, skippedProperties: object, symbols: string[]) {
    const method = 'watchOrderBookForSymbols';
    // as in `watchOrderBook`, a pending subscription can not be cancelled, so the
    // loop has to be bounded by the deadline alone. waiting for every requested
    // symbol to be seen would hang forever whenever one of them stays idle.
    const maxIdleTime = 5000;
    let currentTime = exchange.milliseconds ();
    const deadline = currentTime + 15000;
    let idle = false;
    while ((currentTime < deadline) && !idle) {
        let response: OrderBook | undefined = undefined;
        let succeeded = true;
        const startTime = exchange.milliseconds ();
        try {
            response = await exchange.watchOrderBookForSymbols (symbols);
        } catch (e) {
            // interim workaround for InvalidNonce raised by the c# runtime
            if (!testSharedMethods.isTemporaryFailure (e) && !(e instanceof InvalidNonce)) {
                throw e;
            }
            succeeded = false;
        }
        currentTime = exchange.milliseconds ();
        if ((succeeded === true) && (response !== undefined)) {
            testOrderBook (exchange, skippedProperties, method, response, undefined);
            testSharedMethods.assertInArray (exchange, skippedProperties, method, response, 'symbol', symbols);
            const elapsed = currentTime - startTime;
            if (elapsed > maxIdleTime) {
                idle = true;
            }
        }
    }
    return true;
}

export default testWatchOrderBookForSymbols;
