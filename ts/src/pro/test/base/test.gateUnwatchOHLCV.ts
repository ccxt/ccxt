import assert from 'assert';
import { ArrayCacheByTimestamp } from '../../../base/ws/Cache.js';
import ccxt from '../../../../ccxt.js';

// NO_AUTO_TRANSPILE
// native ts test, intentionally not transpiled - pins the unWatchOHLCV wire
// shape and subscription metadata from https://github.com/ccxt/ccxt/issues/30955
// on gate: the unsubscribe must carry topic 'ohlcv' and symbolsAndTimeframes
// (the shape base cleanCache () expects, same as binance), otherwise the cached
// candles for the symbol/timeframe survive the ack and a resubscribe serves
// stale data

const SPOT_MARKET = {
    'id': 'BTC_USDT',
    'symbol': 'BTC/USDT',
    'base': 'BTC',
    'quote': 'USDT',
    'baseId': 'BTC',
    'quoteId': 'USDT',
    'type': 'spot',
    'spot': true,
    'swap': false,
    'future': false,
    'option': false,
    'contract': false,
    'active': true,
    'precision': { 'amount': 4, 'price': 2 },
    'limits': {},
};

async function testGateUnwatchOHLCV () {
    const exchange = new ccxt.pro.gate ();
    exchange.setMarkets ([ SPOT_MARKET ]);
    assert (exchange.has['unWatchOHLCV'] === true, 'gate must advertise its implemented unWatchOHLCV method');
    let capturedMessage: any = undefined;
    let capturedSubscription: any = undefined;
    (exchange as any).watchMultiple = async (url: any, messageHashes: any, message: any, subscribeHashes: any, subscription: any) => {
        capturedMessage = message;
        capturedSubscription = subscription;
        return true;
    };
    await exchange.unWatchOHLCV ('BTC/USDT', '1m');
    assert (capturedMessage !== undefined, 'unWatchOHLCV must send an unsubscribe request');
    assert (capturedMessage['event'] === 'unsubscribe', 'request event must be unsubscribe');
    assert (capturedMessage['channel'] === 'spot.candlesticks', 'request channel must be the candlesticks channel');
    assert (JSON.stringify (capturedMessage['payload']) === JSON.stringify ([ '1m', 'BTC_USDT' ]), 'payload must be [ interval, marketId ]');
    assert (capturedSubscription['topic'] === 'ohlcv', 'subscription topic must be ohlcv so cleanCache clears the candle cache');
    assert (JSON.stringify (capturedSubscription['symbolsAndTimeframes']) === JSON.stringify ([ [ 'BTC/USDT', '1m' ] ]), 'subscription must carry the unified symbol and timeframe for cleanCache');
    const messageHash = capturedSubscription['messageHashes'][0];
    const subMessageHash = capturedSubscription['subMessageHashes'][0];
    assert (messageHash === 'unsubscribe:candles:1m:BTC/USDT', 'unsubscribe hash must extend the candles subscription hash');
    assert (subMessageHash === 'candles:1m:BTC/USDT', 'sub hash must match the watchOHLCV subscription hash');
    // simulate the exchange ack and assert the candle cache is dropped
    const cachedCandles = new ArrayCacheByTimestamp (10);
    cachedCandles.append ([ 1, 2, 3, 4, 5, 6 ]);
    exchange.ohlcvs = { 'BTC/USDT': { '1m': cachedCandles } };
    const resolved: any[] = [];
    const client: any = {
        'subscriptions': {},
        'futures': {},
        'resolve': (...args: any[]) => { resolved.push (args); },
        'reject': () => {},
    };
    client.subscriptions[messageHash] = capturedSubscription;
    exchange.handleUnSubscribe (client, { 'id': capturedSubscription['id'] });
    assert (!('1m' in exchange.ohlcvs['BTC/USDT']), 'candle cache must be cleared when the unsubscribe ack arrives');
    assert (!(messageHash in client.subscriptions), 'unsubscribe subscription entry must be removed on ack');
}

export default testGateUnwatchOHLCV;
