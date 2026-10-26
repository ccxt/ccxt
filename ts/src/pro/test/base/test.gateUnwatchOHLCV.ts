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
    // aliased timeframe regression: gate maps '1w' -> '7d', so the wire payload
    // uses '7d' and handleOHLCV keys the cache by findTimeframe ('7d') === '7d';
    // the unsubscribe must clear that aliased cache entry, not a '1w' entry
    let capturedMessageAlias: any = undefined;
    let capturedSubscriptionAlias: any = undefined;
    (exchange as any).watchMultiple = async (url: any, messageHashes: any, message: any, subscribeHashes: any, subscription: any) => {
        capturedMessageAlias = message;
        capturedSubscriptionAlias = subscription;
        return true;
    };
    await exchange.unWatchOHLCV ('BTC/USDT', '1w');
    assert (JSON.stringify (capturedMessageAlias['payload']) === JSON.stringify ([ '7d', 'BTC_USDT' ]), 'aliased payload must use the exchange interval id 7d');
    assert (JSON.stringify (capturedSubscriptionAlias['symbolsAndTimeframes']) === JSON.stringify ([ [ 'BTC/USDT', '7d' ] ]), 'subscription must carry the cache key for the aliased timeframe');
    const aliasMessageHash = capturedSubscriptionAlias['messageHashes'][0];
    assert (aliasMessageHash === 'unsubscribe:candles:7d:BTC/USDT', 'aliased unsubscribe hash must use the exchange interval id');
    const cachedAliasCandles = new ArrayCacheByTimestamp (10);
    cachedAliasCandles.append ([ 1, 2, 3, 4, 5, 6 ]);
    exchange.ohlcvs = { 'BTC/USDT': { '7d': cachedAliasCandles } };
    const clientAlias: any = {
        'subscriptions': {},
        'futures': {},
        'resolve': (...args: any[]) => {},
        'reject': () => {},
    };
    clientAlias.subscriptions[aliasMessageHash] = capturedSubscriptionAlias;
    exchange.handleUnSubscribe (clientAlias, { 'id': capturedSubscriptionAlias['id'] });
    assert (!('7d' in exchange.ohlcvs['BTC/USDT']), 'aliased candle cache must be cleared when the unsubscribe ack arrives');
    // unsupported timeframe regression: '2w' is not in gate's timeframes, so
    // findTimeframe misses; the cleanup must fall back to the caller's key
    // and stay a no-op on ack (no undefined cache key, no throw)
    let capturedSubscriptionInvalid: any = undefined;
    (exchange as any).watchMultiple = async (url: any, messageHashes: any, message: any, subscribeHashes: any, subscription: any) => {
        capturedSubscriptionInvalid = subscription;
        return true;
    };
    await exchange.unWatchOHLCV ('BTC/USDT', '2w');
    assert (JSON.stringify (capturedSubscriptionInvalid['symbolsAndTimeframes']) === JSON.stringify ([ [ 'BTC/USDT', '2w' ] ]), 'unsupported timeframe must fall back to the caller key, never undefined');
    const invalidMessageHash = capturedSubscriptionInvalid['messageHashes'][0];
    const cachedOtherCandles = new ArrayCacheByTimestamp (10);
    cachedOtherCandles.append ([ 1, 2, 3, 4, 5, 6 ]);
    exchange.ohlcvs = { 'BTC/USDT': { '1m': cachedOtherCandles } };
    const clientInvalid: any = {
        'subscriptions': {},
        'futures': {},
        'resolve': (...args: any[]) => {},
        'reject': () => {},
    };
    clientInvalid.subscriptions[invalidMessageHash] = capturedSubscriptionInvalid;
    exchange.handleUnSubscribe (clientInvalid, { 'id': capturedSubscriptionInvalid['id'] });
    assert ('1m' in exchange.ohlcvs['BTC/USDT'], 'unsupported timeframe cleanup must be a no-op leaving other cache entries intact');
}

export default testGateUnwatchOHLCV;
