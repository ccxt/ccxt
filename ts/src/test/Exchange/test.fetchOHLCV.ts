
import assert from 'assert';
import testOHLCV from './base/test.ohlcv.js';
import testSharedMethods from './base/test.sharedMethods.js';

async function testFetchOHLCV (exchange, skippedProperties, symbol) {
    const method = 'fetchOHLCV';
    const timeframeKeys = Object.keys (exchange.timeframes);
    assert (timeframeKeys.length, exchange.id + ' ' + method + ' - no timeframes found');
    // prefer 1m timeframe if available, otherwise return the first one
    let chosenTimeframeKey = '1m';
    if (!exchange.inArray (chosenTimeframeKey, timeframeKeys)) {
        chosenTimeframeKey = timeframeKeys[0];
    }
    const limit = 50;
    const durationMs = exchange.parseTimeframe (chosenTimeframeKey) * 1000;
    const since = exchange.milliseconds () - durationMs * limit - 1000;
    const ohlcvs = await exchange.fetchOHLCV (symbol, chosenTimeframeKey, since, limit);
    assert (Array.isArray (ohlcvs), exchange.id + ' ' + method + ' must return an array, returned ' + exchange.json (ohlcvs));
    const now = exchange.milliseconds ();
    for (let i = 0; i < ohlcvs.length; i++) {
        testOHLCV (exchange, skippedProperties, method, ohlcvs[i], symbol, now);
    }
    const logText = testSharedMethods.logTemplate (exchange, method, ohlcvs);
    // check boundaries
    const barsLength = ohlcvs.length;
    const barsLengthAboveZero = barsLength > 0;
    // ensure bars amount is less then limit
    assert (barsLength <= limit, 'Returned bars amount (' + barsLength.toString () + ') is more than requested (' + limit.toString () + ')' + logText);
    // ensure bars amount is more than zero
    if (!barsLengthAboveZero) {
        // zero-amount of bars should not be tolerated for major exchagnes, because it would indicate implementation issue
        // so unless the target exchange (probably mostly lower end exchanges) is skipped, we should assert that
        if (!('compareAmountToZero' in skippedProperties)) {
            assert (barsLengthAboveZero, 'Returned bars amount should be more then zero' + logText);
        }
        // exchange was skipped for zero-bars, then just return and don't do any further check, because there were no ohlcv entries
        return;
    }
    const minActrualTs = ohlcvs[0][0];
    const maxActualTs = ohlcvs[barsLength - 1][0];
    const maxExpectedTs = minActrualTs + durationMs * limit;
    // ensure that timestamps are greaterOrEqual than since
    if (!('compareTimestampToSince' in skippedProperties)) {
        assert (minActrualTs >= since, 'Returned bars earliest timestamp (' + minActrualTs.toString () + ') is before than requested since (' + since.toString () + ')' + logText);
    }
    // ensure last timestamp is under than requested since + limit * duration
    if (limit !== undefined) {
        assert (maxActualTs <= maxExpectedTs, 'Returned bars maximum timestamp (' + maxActualTs.toString () + ') is greater than expected limit timestamp (' + maxExpectedTs.toString () + ')' + logText);
    }
    // ensure current bar ts is >= previous bar + one duration
    if (!('compareDuration' in skippedProperties)) {
        for (let i = 0; i < barsLength; i++) {
            const ohlcv = ohlcvs[i];
            const barTs = ohlcv[0];
            if (i > 0) {
                const previousBarTs = ohlcvs[i - 1][0];
                const diffBetweenCurrentAndPrevious = barTs - previousBarTs;
                assert (diffBetweenCurrentAndPrevious > 0, 'Difference between current bar timestamp (' + barTs.toString () + ') and previous bar timestamp (' + previousBarTs.toString () + ') should be positive' + logText);
                // ensure that the difference is one duration or its multiplier (i.e. current minute bar timestamp should be 60*X seconds more than last bar's timestamp)
                const isInteger = Number.isInteger (diffBetweenCurrentAndPrevious / durationMs);
                assert (isInteger, 'Difference between current bar timestamp (' + barTs.toString () + ') and previous bar timestamp (' + previousBarTs.toString () + ') is not multiplier of duration (' + durationMs.toString () + ')' + logText);
            }
        }
    }
}

export default testFetchOHLCV;
