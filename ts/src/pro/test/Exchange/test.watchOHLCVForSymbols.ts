
import assert from 'assert';
import testOHLCV from '../../../test/Exchange/base/test.ohlcv.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';
import { Exchange } from '../../../../ccxt.js';
import type { NullableDict} from '../../../base/types.js';

async function testWatchOHLCVForSymbols (exchange: Exchange, skippedProperties: object, symbol: string) {
    const method = 'watchOHLCVForSymbols';
    let now = exchange.milliseconds ();
    const ends = now + 15000;
    const timeframeKeys = Object.keys (exchange.timeframes);
    assert (timeframeKeys.length, exchange.id + ' ' + method + ' - no timeframes found');
    // prefer the shortest candle so a new bar can arrive inside the test window
    const preferredTimeframes = [ '1s', '5s', '15s', '30s', '1m' ];
    let chosenTimeframeKey = timeframeKeys[0];
    for (let i = 0; i < preferredTimeframes.length; i++) {
        const timeframeKey = preferredTimeframes[i];
        if (exchange.inArray (timeframeKey, timeframeKeys)) {
            chosenTimeframeKey = timeframeKey;
            break;
        }
    }
    const limit = 10;
    const duration = exchange.parseTimeframe (chosenTimeframeKey);
    const since = exchange.milliseconds () - duration * limit * 1000 - 1000;
    const maxIdleTime = 5000;
    let idle = false;
    while ((now < ends) && !idle) {
        let response: NullableDict = undefined;
        let success = true;
        const startTime = exchange.milliseconds ();
        try {
            response = await exchange.watchOHLCVForSymbols ([ [ symbol, chosenTimeframeKey ] ], since, limit);
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
            const assertionMessage = exchange.id + ' ' + method + ' ' + symbol + ' ' + chosenTimeframeKey + ' | ' + exchange.json (response);
            assert (exchange.isDictionary (response), 'Response must be a dictionary. ' + assertionMessage);
            assert (symbol in response, 'Response should contain the symbol as key. ' + assertionMessage);
            const symbolObj = response[symbol];
            assert (exchange.isDictionary (symbolObj), 'Response.Symbol should be a dictionary. ' + assertionMessage);
            assert (chosenTimeframeKey in symbolObj, 'Response.symbol should contain the timeframe key. ' + assertionMessage);
            const ohlcvs = symbolObj[chosenTimeframeKey];
            assert (Array.isArray (ohlcvs), 'Response.symbol.timeframe should be an array. ' + assertionMessage);
            for (let i = 0; i < ohlcvs.length; i++) {
                testOHLCV (exchange, skippedProperties, method, ohlcvs[i], symbol, now);
            }
            if ((now - startTime) > maxIdleTime) {
                idle = true;
            }
        }
    }
    return true;
}

export default testWatchOHLCVForSymbols;
