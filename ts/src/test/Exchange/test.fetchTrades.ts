import assert from 'assert';
import { Exchange } from "../../../ccxt";
import testSharedMethods from './base/test.sharedMethods.js';
import testTrade from './base/test.trade.js';

async function testFetchTrades (exchange: Exchange, skippedProperties: object, symbol: string) {
    const method = 'fetchTrades';
    const trades = await exchange.fetchTrades (symbol);
    testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, trades);
    const now = exchange.milliseconds ();
    for (let i = 0; i < trades.length; i++) {
        testTrade (exchange, skippedProperties, method, trades[i], symbol, now);
        testSharedMethods.assertInArray (exchange, skippedProperties, method, trades[i], 'takerOrMaker', [ 'taker', undefined ]);
    }
    if (!('timestamp' in skippedProperties)) {
        testSharedMethods.assertTimestampOrder (exchange, method, symbol, trades);
    }
}

export default testFetchTrades;
