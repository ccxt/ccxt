
import assert from 'assert';
import testOHLCV from '../../../test/Exchange/base/test.ohlcv.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';

async function testWatchOHLCVForSymbols (exchange, skippedProperties, symbol) {
    const method = 'watchOHLCVForSymbols';
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
            response = await exchange.watchOHLCVForSymbols ([ symbol, chosenTimeframeKey ], since, limit);
        } catch (e) {
            if (!testSharedMethods.isTemporaryFailure (e)) {
                throw e;
            }
            now = exchange.milliseconds ();
            continue;
        }
        const assertionMessage = exchange.id + ' ' + method + ' ' + symbol + ' ' + chosenTimeframeKey + ' | ' + exchange.json (response);
        assert (typeof response === 'object', 'Response must be a dictionary. ' + assertionMessage);
        assert (symbol in response, 'Response should contain the symbol as key. ' + assertionMessage);
        const symbolObj = response[symbol];
        assert (typeof symbolObj === 'object', 'Response.Symbol should be a dictionary. ' + assertionMessage);
        assert (chosenTimeframeKey in symbolObj, 'Response.symbol should contain the timeframe key. ' + assertionMessage);
        const ohlcvs = symbolObj[chosenTimeframeKey];
        assert (Array.isArray (ohlcvs), 'Response.symbol.timeframe should be an array. ' + assertionMessage);
        now = exchange.milliseconds ();
        for (let i = 0; i < ohlcvs.length; i++) {
            testOHLCV (exchange, skippedProperties, method, ohlcvs[i], symbol, now);
        }
    }
}

export default testWatchOHLCVForSymbols;
