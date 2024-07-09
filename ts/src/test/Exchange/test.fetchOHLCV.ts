import assert from 'assert';
import { Exchange } from "../../../ccxt";
import testOHLCV from './base/test.ohlcv.js';
import testSharedMethods from './base/test.sharedMethods.js';

async function testFetchOHLCV (exchange: Exchange, skippedProperties: object, symbol: string) {
    const method = 'fetchOHLCV';
    const timeframeKeys = Object.keys (exchange.timeframes);
    assert (timeframeKeys.length, exchange.id + ' ' + method + ' - no timeframes found');
    // prefer 1m timeframe if available, otherwise return the first one
    let chosenTimeframeKey = '1m';
    if (!exchange.inArray (chosenTimeframeKey, timeframeKeys)) {
        chosenTimeframeKey = timeframeKeys[0];
    }
    const limit = 10;
    const duration = exchange.parseTimeframe (chosenTimeframeKey);
    const since = exchange.milliseconds () - duration * limit * 1000 - 1000;
    const ohlcvs = await exchange.fetchOHLCV (symbol, chosenTimeframeKey, since, limit);
    testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, ohlcvs, symbol);
    const now = exchange.milliseconds ();
    for (let i = 0; i < ohlcvs.length; i++) {
        testOHLCV (exchange, skippedProperties, method, ohlcvs[i], symbol, now);
    }
    // todo: sorted timestamps check
}

export default testFetchOHLCV;
