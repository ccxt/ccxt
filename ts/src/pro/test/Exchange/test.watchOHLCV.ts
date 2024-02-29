
import assert from 'assert';
import testOHLCV from '../../../test/Exchange/base/test.ohlcv.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';

async function testWatchOHLCV (exchange, skippedProperties, symbol) {
    const method = 'watchOHLCV';
    let now = exchange.milliseconds ();
    const ends = now + 15000;
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
    while (now < ends) {
        let response = undefined;
        try {
            response = await exchange.watchOHLCV ([ symbol, chosenTimeframeKey ], since, limit);
        } catch (e) {
            if (!testSharedMethods.isTemporaryFailure (e)) {
                throw e;
            }
            now = exchange.milliseconds ();
            continue;
        }
        assert (Array.isArray (response), exchange.id + ' ' + method + ' ' + symbol + ' must return an array. ' + exchange.json (response));
        now = exchange.milliseconds ();
        for (let i = 0; i < response.length; i++) {
            testOHLCV (exchange, skippedProperties, method, response[i], symbol, now);
        }
    }
}

export default testWatchOHLCV;
