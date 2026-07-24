
import assert from 'assert';
import testOrderBook from '../../../test/Exchange/base/test.orderBook.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';
import { InvalidNonce } from '../../../base/errors.js';
import { Exchange, OrderBook } from '../../../../ccxt.js';

async function testWatchOrderBookForSymbols (exchange: Exchange, skippedProperties: object, symbols: string[]) {
    const method = 'watchOrderBookForSymbols';
    let currentTime = exchange.milliseconds ();
    const deadline = currentTime + 15000;
    const seenSymbols: string[] = [];
    // keep polling until the time window elapses and every requested symbol has been observed
    while (currentTime < deadline || seenSymbols.length < symbols.length) {
        let response: OrderBook | undefined = undefined;
        let succeeded = true;
        try {
            response = await exchange.watchOrderBookForSymbols (symbols);
        } catch (e) {
            // interim workaround for InvalidNonce raised by the c# runtime
            if (!testSharedMethods.isTemporaryFailure (e) && !(e instanceof InvalidNonce)) {
                throw e;
            }
            currentTime = exchange.milliseconds ();
            succeeded = false;
        }
        if (succeeded === true) {
            const orderBookCopy = response.copy ();
            testOrderBook (exchange, skippedProperties, method, orderBookCopy, undefined);
            testSharedMethods.assertInArray (exchange, skippedProperties, method, orderBookCopy, 'symbol', symbols);
            const symbol = response['symbol'];
            if ((symbol !== undefined) && !exchange.inArray (symbol, seenSymbols)) {
                seenSymbols.push (symbol);
            }
        }
    }
    return true;
}

export default testWatchOrderBookForSymbols;
