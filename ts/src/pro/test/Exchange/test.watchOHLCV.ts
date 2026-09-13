
import assert from 'assert';
import testOHLCV from '../../../test/Exchange/base/test.ohlcv.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';
import { Exchange } from '../../../../ccxt.js';

async function testWatchOHLCV (exchange: Exchange, skippedProperties: object, symbol: string) {
    const method = 'watchOHLCV';
    let now = exchange.milliseconds ();
    const ends = now + 15000;
    const timeframeKeys = Object.keys (exchange.timeframes);
    assert (timeframeKeys.length > 0, exchange.id + ' ' + method + ' - no timeframes found');
    // prefer 1m timeframe if available, otherwise return the first one
    let chosenTimeframeKey = '1m';
    if (!exchange.inArray (chosenTimeframeKey, timeframeKeys)) {
        chosenTimeframeKey = timeframeKeys[0];
    }
    const limit = 10;
    const duration = exchange.parseTimeframe (chosenTimeframeKey);
    const since = exchange.milliseconds () - duration * limit * 1000 - 1000;
    const maxIdleTime = 5000;
    let idle = false;
    while ((now < ends) && !idle) {
        let response: any = undefined;
        let success = true;
        const startTime = exchange.milliseconds ();
        try {
            response = await exchange.watchOHLCV (symbol, chosenTimeframeKey, since, limit);
            if (response === undefined) {
                throw new Error (exchange.id + ' watch returned undefined response');
            }
        } catch (e) {
            if (!testSharedMethods.isTemporaryFailure (e)) {
                throw e;
            }
            success = false;
        }
        now = exchange.milliseconds ();
        if ((success === true) && (response !== undefined)) {
            testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, response, symbol);
            for (let i = 0; i < response.length; i++) {
                testOHLCV (exchange, skippedProperties, method, response[i], symbol, now);
            }
            if ((now - startTime) > maxIdleTime) {
                idle = true;
            }
        }
    }
    return true;
}

export default testWatchOHLCV;
