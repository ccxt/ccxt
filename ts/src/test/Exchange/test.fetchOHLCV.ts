
import assert from 'assert';
import testOHLCV from './base/test.ohlcv.js';
import testSharedMethods from './base/test.sharedMethods.js';

async function testFetchOHLCV (exchange, skippedProperties, symbol) {
    const method = 'fetchOHLCV';
    const timeframeKeys = Object.keys (exchange.timeframes);
    const logText = testSharedMethods.logTemplate (exchange, method, {});
    assert (timeframeKeys.length, exchange.id + ' ' + method + ' - no timeframes found' + logText);
    // prefer 1m timeframe if available, otherwise return the first one
    let timeframe = '1m';
    if (!exchange.inArray (timeframe, timeframeKeys)) {
        timeframe = timeframeKeys[0];
    }
<<<<<<< HEAD
    const durationMs = exchange.parseTimeframe (timeframe) * 1000;
    //
    // check for all four possible "since" & "limit" combinations, where one of them could be undefined and the other not
    //
    const sinceArray = [ undefined, exchange.milliseconds () - durationMs * 2000 ];// for example, "since" was theoretically from date of 2000 bars back
    const limitsArray = [ undefined, 50 ];
    for (let i = 0; i < sinceArray.length; i++) {
        const since = sinceArray[i];
        for (let j = 0; j < limitsArray.length; j++) {
            const limit = limitsArray[j];
            const ohlcvs = await exchange.fetchOHLCV (symbol, timeframe, since, limit);
            testFetchOHLCVChecker (exchange, skippedProperties, symbol, ohlcvs, timeframe, limit, since);
        }
    }
}

function testFetchOHLCVChecker (exchange, skippedProperties, symbol, ohlcvs, timeframe, limit, since) {
    const method = 'fetchOHLCV';
    let logText = testSharedMethods.logTemplate (exchange, method, {});
    assert (Array.isArray (ohlcvs), exchange.id + ' ' + method + ' must return an array, returned ' + logText);
    logText = logText + '' + exchange.json (ohlcvs); // trick transpiler
=======
    const limit = 10;
    const duration = exchange.parseTimeframe (chosenTimeframeKey);
    const since = exchange.milliseconds () - duration * limit * 1000 - 1000;
    const ohlcvs = await exchange.fetchOHLCV (symbol, chosenTimeframeKey, since, limit);
    testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, ohlcvs, symbol);
>>>>>>> 12eafcfb1a0df69923268d7681f288fe2a3c17a2
    const now = exchange.milliseconds ();
    for (let i = 0; i < ohlcvs.length; i++) {
        testOHLCV (exchange, skippedProperties, method, ohlcvs[i], symbol, now);
    }
    const durationMs = exchange.parseTimeframe (timeframe) * 1000;
    const barsLength = ohlcvs.length;
    // check bars amounts, to be between 0 and limit
    // less then limit
    if (limit !== undefined) {
        assert (barsLength <= limit, 'Returned bars amount (' + barsLength.toString () + ') is more than requested (' + limit.toString () + ')' + logText);
    }
    // ensure bars amount is more than zero
    if (barsLength === 0) {
        // zero-amount of bars should not be tolerated for major exchagnes, because it would indicate implementation issue
        // so unless the target exchange (probably mostly lower end exchanges) is skipped, we should assert that
        if (!('compareAmountToZero' in skippedProperties)) {
            assert (barsLength > 0, 'Returned bars amount should be more then zero' + logText);
        }
        // exchange was skipped for zero-bars, then just return and don't do any further check, because there were no ohlcv entries
        return;
    }
    // else we continue and check timestamps
    for (let i = 0; i < barsLength; i++) {
        const ohlcv = ohlcvs[i];
        const barTs = ohlcv[0];
        // if this is the first bar, then ensure last timestamp is under than requested since + limit * duration
        if (!('compareTimestampToSince' in skippedProperties)) {
            if (i === 0 && since !== undefined) {
                assert (barTs >= since, 'Returned bars earliest timestamp (' + barTs.toString () + ') is before than requested since (' + since.toString () + ')' + logText);
                continue;
            }
        }
        // if this is the last bar, then check if it's <= now
        if (i === barsLength - 1) {
            if (!('compareToNow' in skippedProperties)) {
                assert (barTs <= now, 'Returned bars latest timestamp (' + barTs.toString () + ') is after than current timestamp (' + now.toString () + ')' + logText);
            }
        }
        // we do compare bar durations below (unless skipped), to ensure current bar's timestamp >= previous bar + one duration
        if (!('compareDuration' in skippedProperties)) {
            if (i > 0) {
                const previousBarTs = ohlcvs[i - 1][0];
                const diffBetweenCurrentAndPrevious = barTs - previousBarTs;
                assert (diffBetweenCurrentAndPrevious > 0, 'Difference between current bar timestamp (' + barTs.toString () + ') and previous bar timestamp (' + previousBarTs.toString () + ') should be positive' + logText);
                // ensure that the difference is one duration or its multiplier (i.e. current minute bar timestamp should be 60*X seconds more than last bar's timestamp)
                const isRoundNumber = testSharedMethods.hasRoundedValue (diffBetweenCurrentAndPrevious / durationMs);
                assert (isRoundNumber, 'Difference between current bar timestamp (' + barTs.toString () + ') and previous bar timestamp (' + previousBarTs.toString () + ') is not multiplier of duration (' + durationMs.toString () + ')' + logText);
            }
        }
    }
}

export default testFetchOHLCV;
