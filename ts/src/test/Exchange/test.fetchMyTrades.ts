import assert from 'assert';
import { Exchange } from "../../../ccxt";
import testSharedMethods from './base/test.sharedMethods.js';
import testTrade from './base/test.trade.js';

async function testFetchMyTrades (exchange: Exchange, skippedProperties: object, symbol: string) {
    const method = 'fetchMyTrades';
    const trades = await exchange.fetchMyTrades (symbol);
    testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, trades, symbol);
    const now = exchange.milliseconds ();
    for (let i = 0; i < trades.length; i++) {
        testTrade (exchange, skippedProperties, method, trades[i], symbol, now, false);
    }
    testSharedMethods.assertTimestampOrder (exchange, method, symbol, trades);
}

export default testFetchMyTrades;
