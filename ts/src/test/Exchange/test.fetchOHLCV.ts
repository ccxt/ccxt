import assert from 'assert';
import { Exchange } from "../../../ccxt.js";
import testOHLCV from './base/test.ohlcv.js';
import testSharedMethods from './base/test.sharedMethods.js';
import Precise from '../../base/Precise.js';
import type { Num, Str } from '../../base/types.js';

async function testFetchOHLCV (exchange: Exchange, skippedProperties: object, symbol: string) {
    const method = 'fetchOHLCV';
    const timeframeKeys = Object.keys (exchange.timeframes);
    const logText = testSharedMethods.logTemplate (exchange, method, {});
    assert (timeframeKeys.length > 0, exchange.id + ' ' + method + ' - no timeframes found' + logText);    // prefer 1m timeframe if available, otherwise return the first one
    let chosenTimeframeKey = '1m';
    if (!exchange.inArray (chosenTimeframeKey, timeframeKeys)) {
        chosenTimeframeKey = timeframeKeys[0];
    }
    const durationMs = exchange.parseTimeframe (chosenTimeframeKey) * 1000;
    //
    // check for all possible "since" & "limit" combinations, where one of them could be undefined and the other not
    //
    const sinceArray = [ undefined, exchange.milliseconds () - durationMs * 2800 ]; // eg, "since" was a date of 2800 bars back
    const limitsArray = [ undefined, 50, 25000 ];
    for (let i = 0; i < sinceArray.length; i++) {
        const sinceCurrent = sinceArray[i];
        for (let j = 0; j < limitsArray.length; j++) {
            const limit = limitsArray[j];
            const ohlcvs = await exchange.fetchOHLCV (symbol, chosenTimeframeKey, sinceCurrent, limit);
            // we can't expect array to have values, because requested period might have zero bars for valid reason
            // testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, ohlcvs, symbol);
            helperFetchOHLCVChecker (exchange, skippedProperties, symbol, ohlcvs, chosenTimeframeKey, sinceCurrent, limit);
        }
    }
    await helperFetchOHLCVVolumeNotional (exchange, skippedProperties, symbol, timeframeKeys);
    return true;
}

function helperFetchOHLCVChecker (exchange: Exchange, skippedProperties: object, symbol: string, ohlcvs: any, timeframe: Str, since: Num, limit: Num) {
    const method = 'fetchOHLCV';
    let logText = testSharedMethods.logTemplate (exchange, method, {});
    assert (Array.isArray (ohlcvs), exchange.id + ' ' + method + ' must return an array, returned ' + logText);
    const now = exchange.milliseconds ();
    for (let i = 0; i < ohlcvs.length; i++) {
        testOHLCV (exchange, skippedProperties, method, ohlcvs[i] as number[], symbol, now);
    }
    const durationMs = exchange.parseTimeframe (timeframe) * 1000;
    const barsLength = ohlcvs.length;
    // check bars amounts, to be between 0 and limit
    // less then limit
    if (limit !== undefined) {
        assert (barsLength <= limit, 'Returned bars amount (' + barsLength.toString () + ') is more than requested (' + limit.toString () + ')' + logText + '' + exchange.json (ohlcvs));
    }
    // ensure bars amount is more than zero
    if (barsLength === 0) {
        // zero-amount of bars should not be tolerated for major exchanges, because it would indicate implementation issue
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
        // if this is the first bar, then ensure its timestamp is not earlier than requested "since"
        if (!('compareTimestampToSince' in skippedProperties)) {
            if (i === 0 && since !== undefined) {
                assert (barTs >= since, 'Returned bars earliest timestamp (' + barTs.toString () + ') is before than requested since (' + since.toString () + ')' + logText);
            }
        }
        // if this is the last bar, then check if it's <= now
        if (i === barsLength - 1) {
            if (!('compareToNow' in skippedProperties)) {
                assert (barTs <= now, 'Returned bars latest timestamp (' + barTs.toString () + ') is after than current timestamp (' + now.toString () + ')' + logText);
            }
            // and ensure the last bar's timestamp does not exceed the requested "since + limit * duration" upper bound
            if (!('compareTimestampToLimit' in skippedProperties)) {
                if (since !== undefined && limit !== undefined) {
                    const maxExpectedTs = since + (limit * durationMs);
                    assert (barTs <= maxExpectedTs, 'Returned bars latest timestamp (' + barTs.toString () + ') is after than requested since + limit * duration (' + maxExpectedTs.toString () + ')' + logText);
                }
            }
        }
        // we compare bar durations below (unless skipped), to ensure current bar's timestamp >= previous bar + one duration
        if (!('compareDuration' in skippedProperties)) {
            if (i > 0) {
                const previousBarTs = ohlcvs[i - 1][0];
                const diffBetweenCurrentAndPrevious = barTs - previousBarTs;
                assert (diffBetweenCurrentAndPrevious > 0, 'Difference between current bar timestamp (' + barTs.toString () + ') and previous bar timestamp (' + previousBarTs.toString () + ') should be positive' + logText);
                // ensure that the difference is one duration or its multiplier (i.e. current minute bar timestamp should be 60*X seconds more than last bar's timestamp)
                const isRoundNumber = exchange.isRoundNumber (diffBetweenCurrentAndPrevious / durationMs);
                assert (isRoundNumber, 'Difference between current bar timestamp (' + barTs.toString () + ') and previous bar timestamp (' + previousBarTs.toString () + ') is not multiplier of duration (' + durationMs.toString () + ')' + logText);
            }
        }
    }
}

async function helperFetchOHLCVVolumeNotional (exchange: Exchange, skippedProperties: object, symbol: string, timeframeKeys: string[]) {
    const method = 'fetchOHLCV';
    // compare one closed 1d candle to ticker quoteVolume when the volume unit is declared
    const volumeUnit = exchange.featureValue (symbol, 'fetchOHLCV', 'volume');
    const allowedVolumeUnits = [ 'base', 'quote', 'contracts' ];
    if (!exchange.inArray (volumeUnit, allowedVolumeUnits)) {
        return true;
    }
    if (exchange.has['fetchTicker'] !== true) {
        return true;
    }
    if (!exchange.inArray ('1d', timeframeKeys)) {
        return true;
    }
    if ('ohlcvVolumeNotional' in skippedProperties) {
        return true;
    }
    const market = exchange.market (symbol);
    // inverse tickers report quoteVolume in the base coin, so it is not comparable with the candle notional
    if (exchange.safeBool (market, 'inverse') === true) {
        return true;
    }
    let candleLimit = 100;
    const maxLimit = exchange.featureValue (symbol, 'fetchOHLCV', 'limit');
    if ((maxLimit !== undefined) && (maxLimit < candleLimit)) {
        candleLimit = maxLimit;
    }
    const ticker = await exchange.fetchTicker (symbol);
    const dailyCandles = await exchange.fetchOHLCV (symbol, '1d', undefined, candleLimit);
    const nowMs = exchange.milliseconds ();
    const oneDay = 86400000;
    const wholeDays = exchange.parseToInt (nowMs / oneDay);
    const utcDayStart = wholeDays * oneDay;
    let closedCandle = undefined;
    let closedTimestamp = undefined;
    const candlesLength = dailyCandles.length;
    for (let i = 0; i < candlesLength; i++) {
        const candle = dailyCandles[i];
        const candleTimestamp = exchange.safeInteger (candle, 0);
        if ((candleTimestamp !== undefined) && (candleTimestamp < utcDayStart)) {
            if ((closedTimestamp === undefined) || (candleTimestamp > closedTimestamp)) {
                closedCandle = candle;
                closedTimestamp = candleTimestamp;
            }
        }
    }
    if (closedCandle === undefined) {
        return true;
    }
    const close = exchange.omitZero (exchange.safeString (closedCandle, 4));
    const candleVolume = exchange.omitZero (exchange.safeString (closedCandle, 5));
    const quoteVolume = exchange.omitZero (exchange.safeString (ticker, 'quoteVolume'));
    if ((close === undefined) || (candleVolume === undefined) || (quoteVolume === undefined)) {
        return true;
    }
    let contractSize = exchange.safeString (market, 'contractSize');
    if (contractSize === undefined) {
        contractSize = '1';
    }
    let notional: Str = candleVolume;
    if (volumeUnit === 'quote') {
        notional = candleVolume;
    } else {
        let multiplier = '1';
        if (volumeUnit === 'contracts') {
            multiplier = contractSize;
        }
        notional = Precise.stringMul (Precise.stringMul (candleVolume, multiplier), close);
    }
    let larger = notional;
    let smaller: Str = quoteVolume;
    if (Precise.stringGt (quoteVolume, notional)) {
        larger = quoteVolume;
        smaller = notional;
    }
    const threshold = Precise.stringMul (smaller, '10');
    const logText = testSharedMethods.logTemplate (exchange, method, closedCandle);
    assert (Precise.stringLt (larger, threshold), exchange.id + ' ' + symbol + ' ' + method + ' candle notional ' + notional + ' (' + volumeUnit + ') is not within 10x of ticker quoteVolume ' + quoteVolume + logText);
    return true;
}

export default testFetchOHLCV;
