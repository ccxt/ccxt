
import testOrder from '../../../test/Exchange/base/test.order.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';
import { Exchange, ExchangeError, Message } from '../../../../ccxt.js';

async function testWatchOrders (exchange: Exchange, skippedProperties: object, symbol: string) {
    const method = 'watchOrders';
    let now = exchange.milliseconds ();
    const ends = now + 15000;
    const consumer = function consumer (message: Message) {
        if (message.error) {
            throw new ExchangeError (message.error);
        }
        if (!message.payload) {
            throw new ExchangeError ("received null or undefined payload");
        }
        // TODO: add payload test
    };
    try {
        await exchange.subscribeOrders (symbol, consumer);
    } catch (e) {
        if (!testSharedMethods.isTemporaryFailure (e)) {
            throw e;
        }
    }
    while (now < ends) {
        let response = undefined;
        try {
            response = await exchange.watchOrders (symbol);
        } catch (e) {
            if (!testSharedMethods.isTemporaryFailure (e)) {
                throw e;
            }
            now = exchange.milliseconds ();
            continue;
        }
        testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, response, symbol);
        now = exchange.milliseconds ();
        for (let i = 0; i < response.length; i++) {
            testOrder (exchange, skippedProperties, method, response[i], symbol, now);
        }
        testSharedMethods.assertTimestampOrder (exchange, method, symbol, response);
    }
}

export default testWatchOrders;
