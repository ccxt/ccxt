
import assert from 'assert';
import testPosition from '../../../test/Exchange/base/test.position.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';
import { Exchange, ExchangeError, Message } from '../../../../ccxt.js';

async function testWatchPosition (exchange: Exchange, skippedProperties: object, symbol: string) {
    const method = 'watchPosition';
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
    await exchange.subscribePosition (symbol, consumer);
    while (now < ends) {
        let response = undefined;
        try {
            response = await exchange.watchPosition (symbol);
        } catch (e) {
            if (!testSharedMethods.isTemporaryFailure (e)) {
                throw e;
            }
            now = exchange.milliseconds ();
            continue;
        }
        assert (typeof response === 'object', exchange.id + ' ' + method + ' ' + symbol + ' must return an object. ' + exchange.json (response));
        now = exchange.milliseconds ();
        testPosition (exchange, skippedProperties, method, response, undefined, now);
    }
}

export default testWatchPosition;
