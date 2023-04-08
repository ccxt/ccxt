
import assert from 'assert';
import testOHLCV from './base/test.ohlcv.js';

async function testFetchOHLCV (exchange, symbol) {
    const method = 'fetchOHLCV';
    const timeframes = Object.keys (exchange.timeframes);
    assert (timeframes.length > 0, exchange.id + ' ' + method + ' - no timeframes found');
    const timeframe = timeframes[0];
    const limit = 10;
    const duration = exchange.parseTimeframe (timeframe);
    const since = exchange.milliseconds () - duration * limit * 1000 - 1000;
    const ohlcvs = await exchange[method] (symbol, timeframe, since, limit);
    assert (Array.isArray (ohlcvs), exchange.id + ' ' + method + ' must return an array, returned ' + exchange.json (ohlcvs));
    const now = exchange.milliseconds ();
    for (let i = 0; i < ohlcvs.length; i++) {
        testOHLCV (exchange, method, ohlcvs[i], symbol, now);
    }
    // todo: sorted timestamps check
}

export default testFetchOHLCV;
