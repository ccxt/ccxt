import assert from 'assert';
import { Exchange } from "../../../ccxt.js";
import testOHLCV from './base/test.ohlcv.js';
import testSharedMethods from './base/test.sharedMethods.js';
import Precise from '../../base/Precise.js';

async function testFetchOHLCV (exchange: Exchange, skippedProperties: object, symbol: string) {
    const method = 'fetchOHLCV';
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
    const ohlcvs = await exchange.fetchOHLCV (symbol, chosenTimeframeKey, since, limit);
    testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, ohlcvs, symbol);
    const now = exchange.milliseconds ();
    for (let i = 0; i < ohlcvs.length; i++) {
        testOHLCV (exchange, skippedProperties, method, ohlcvs[i] as number[], symbol, now);
    }
    // todo: sorted timestamps check
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
    const market = exchange.market (symbol);
    let contractSize = exchange.safeString (market, 'contractSize');
    if (contractSize === undefined) {
        contractSize = '1';
    }
    let notional = candleVolume;
    if (volumeUnit === 'quote') {
        notional = candleVolume;
    } else if ((volumeUnit === 'contracts') && (exchange.safeBool (market, 'inverse') === true)) {
        notional = Precise.stringMul (candleVolume, contractSize);
    } else {
        let multiplier = '1';
        if (volumeUnit === 'contracts') {
            multiplier = contractSize;
        }
        notional = Precise.stringMul (Precise.stringMul (candleVolume, multiplier), close);
    }
    let larger = notional;
    let smaller = quoteVolume;
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
