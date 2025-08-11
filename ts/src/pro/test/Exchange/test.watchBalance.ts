
import { ExchangeError } from '../../../base/errors.js';
import { Message } from '../../../base/types.js';
import testBalance from '../../../test/Exchange/base/test.balance.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';

async function testWatchBalance (exchange, skippedProperties, code) {
    const method = 'watchBalance';
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
        await exchange.subscribeBalance (consumer);
    } catch (e) {
        if (!testSharedMethods.isTemporaryFailure (e)) {
            throw e;
        }
    }
    while (now < ends) {
        let response = undefined;
        try {
            response = await exchange.watchBalance ();
        } catch (e) {
            if (!testSharedMethods.isTemporaryFailure (e)) {
                throw e;
            }
            now = exchange.milliseconds ();
            continue;
        }
        testBalance (exchange, skippedProperties, method, response);
        now = exchange.milliseconds ();
    }
}

export default testWatchBalance;
