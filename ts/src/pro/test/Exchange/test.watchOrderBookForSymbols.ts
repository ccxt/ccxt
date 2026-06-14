
import assert from 'assert';
import testOrderBook from '../../../test/Exchange/base/test.orderBook.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';
import { InvalidNonce } from '../../../base/errors.js';
import { Exchange } from '../../../../ccxt.js';

async function testWatchOrderBookForSymbols (exchange: Exchange, skippedProperties: object, symbols: string[]) {
    const method = 'watchOrderBookForSymbols';
    let now = exchange.milliseconds ();
    const ends = now + 15000;
    const returnedSymbols = [];
    while (now < ends || returnedSymbols.length < symbols.length) {
        let response = undefined;
        let success = true;
        try {
            response = await exchange.watchOrderBookForSymbols (symbols);
        } catch (e) {
            // temporary fix for InvalidNonce for c#
            if (!testSharedMethods.isTemporaryFailure (e) && !(e instanceof InvalidNonce)) {
                throw e;
            }
            now = exchange.milliseconds ();
            // continue;
            success = false;
        }
        if (success === true) {
            now = exchange.milliseconds ();
            testSharedMethods.assertInArray (exchange, skippedProperties, method, response, 'symbol', symbols);
            testOrderBook (exchange, skippedProperties, method, response, undefined);
            const symbol = response['symbol'];
            if (!exchange.inArray (symbol, returnedSymbols)) {
                returnedSymbols.push (symbol);
            }
        }
    }
    return true;
}

export default testWatchOrderBookForSymbols;
