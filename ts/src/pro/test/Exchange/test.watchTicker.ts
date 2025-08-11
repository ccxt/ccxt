
import assert from 'assert';
import testTicker from '../../../test/Exchange/base/test.ticker.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';
import { ConsumerFunction, Exchange, ExchangeError, Message } from '../../../../ccxt.js';


async function testWatchTicker (exchange: Exchange, skippedProperties: object, symbol: string) {
    const method = 'watchTicker';
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
        await exchange.subscribeTicker (symbol, consumer);
    }
    catch (e) {
        if (!testSharedMethods.isTemporaryFailure (e)) {
            throw e;
        }
    }
    while (now < ends) {
        let response = undefined;
        try {
            response = await exchange.watchTicker (symbol);
        } catch (e) {
            if (!testSharedMethods.isTemporaryFailure (e)) {
                throw e;
            }
            now = exchange.milliseconds ();
            continue;
        }
        assert (typeof response === 'object', exchange.id + ' ' + method + ' ' + symbol + ' must return an object. ' + exchange.json (response));
        now = exchange.milliseconds ();
        testTicker (exchange, skippedProperties, method, response, symbol);
    }
}

export default testWatchTicker;
