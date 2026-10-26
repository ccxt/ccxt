import assert from 'assert';
import { UnsubscribeError } from '../../../base/errors.js';
import ccxt from '../../../../ccxt.js';

// NO_AUTO_TRANSPILE
// native ts test, intentionally not transpiled - pins what kraken's per-symbol
// unsubscribe acks release: the static ws fixtures start with empty caches, so
// they prove the unWatch* call resolves but not that the trades / ohlcv caches
// are dropped. here the caches are seeded through the real handlers first, and
// the unWatch* calls run against a stubbed transport so the hashes they wait
// on come from the real implementation instead of being hardcoded

function tick () {
    // let the unWatch* call get past loadMarkets and send its request
    return new Promise ((resolve) => setTimeout (resolve, 0));
}

function spotMarket (id: string, base: string, quote: string) {
    return {
        'id': id,
        'symbol': base + '/' + quote,
        'base': base,
        'quote': quote,
        'baseId': base,
        'quoteId': quote,
        'type': 'spot',
        'spot': true,
        'swap': false,
        'future': false,
        'option': false,
        'contract': false,
        'active': true,
        'precision': { 'amount': 0.00000001, 'price': 0.1 },
        'limits': {},
    };
}

function makeOfflineKraken () {
    const exchange = new ccxt.pro.kraken ({});
    exchange.setMarkets ([ spotMarket ('XXBTZUSD', 'BTC', 'USD'), spotMarket ('XXRPZUSD', 'XRP', 'USD') ]);
    exchange.options['marketsByWsName'] = {}; // skip the loadMarkets override rebuilding it
    const url = exchange.urls['api']['ws']['publicV2'];
    const client = exchange.client (url);
    const sent: any[] = [];
    // transport-level stub: register the hashes the way the base methods do,
    // but never connect
    const register = (messageHashes: string[], message: any) => {
        sent.push (message);
        for (let i = 0; i < messageHashes.length; i++) {
            client.subscriptions[messageHashes[i]] = true;
        }
        return Promise.race (messageHashes.map ((hash) => client.future (hash)));
    };
    (exchange as any).watch = async (u: any, messageHash: any, message: any) => register ([ messageHash ], message);
    (exchange as any).watchMultiple = async (u: any, messageHashes: any, message: any) => register (messageHashes, message);
    return { exchange, client, sent };
}

function tradeFrame (symbol: string, tradeId: number) {
    return {
        'channel': 'trade',
        'type': 'update',
        'data': [ {
            'symbol': symbol,
            'side': 'buy',
            'price': 100.5,
            'qty': 1.0,
            'ord_type': 'limit',
            'trade_id': tradeId,
            'timestamp': '2026-10-26T16:12:34.112047Z',
        } ],
    };
}

function ohlcFrame (symbol: string, interval: number) {
    return {
        'channel': 'ohlc',
        'type': 'update',
        'data': [ {
            'symbol': symbol,
            'open': 100,
            'high': 101,
            'low': 99,
            'close': 100.5,
            'trades': 3,
            'volume': 1.5,
            'vwap': 100.2,
            'interval_begin': '2026-10-26T16:10:00.000000000Z',
            'interval': interval,
        } ],
    };
}

function ack (result: any) {
    return {
        'method': 'unsubscribe',
        'req_id': 1,
        'result': result,
        'success': true,
        'time_in': '2026-10-26T16:12:36.610321Z',
        'time_out': '2026-10-26T16:12:36.610446Z',
    };
}

async function testTrades () {
    const { exchange, client, sent } = makeOfflineKraken ();
    exchange.handleMessage (client, tradeFrame ('BTC/USD', 1));
    exchange.handleMessage (client, tradeFrame ('XRP/USD', 2));
    assert (exchange.trades['BTC/USD'].length === 1 && exchange.trades['XRP/USD'].length === 1, 'trades: caches seeded by handleTrades');
    // an armed watchTrades on both symbols
    const btcHash = exchange.getMessageHash ('trade', undefined, 'BTC/USD');
    const xrpHash = exchange.getMessageHash ('trade', undefined, 'XRP/USD');
    client.subscriptions[btcHash] = true;
    client.subscriptions[xrpHash] = true;
    const btcWatcher = client.future (btcHash).then (() => undefined, (e: any) => e);
    const unWatching = exchange.unWatchTrades ('BTC/USD');
    await tick ();
    assert.deepEqual (sent[0]['params'], { 'channel': 'trade', 'symbol': [ 'BTC/USD' ] }, 'trades: unsubscribe request');
    exchange.handleMessage (client, ack ({ 'channel': 'trade', 'symbol': 'BTC/USD' }));
    assert.strictEqual (await unWatching, true, 'trades: unWatchTrades resolves on the ack');
    assert ((await btcWatcher) instanceof UnsubscribeError, 'trades: pending watcher rejected with UnsubscribeError');
    assert (!('BTC/USD' in exchange.trades), 'trades: acked symbol cache released');
    assert (exchange.trades['XRP/USD'].length === 1, 'trades: other symbol cache untouched');
    assert (!(btcHash in client.subscriptions), 'trades: acked subscription removed so a re-watch subscribes again');
    assert (xrpHash in client.subscriptions, 'trades: other subscription kept');
}

async function testOHLCV () {
    const { exchange, client, sent } = makeOfflineKraken ();
    exchange.handleMessage (client, ohlcFrame ('BTC/USD', 1));
    exchange.handleMessage (client, ohlcFrame ('BTC/USD', 5));
    assert.deepEqual (Object.keys (exchange.ohlcvs['BTC/USD']).sort (), [ '1m', '5m' ], 'ohlcv: caches seeded by handleOHLCV');
    const unWatching = exchange.unWatchOHLCV ('BTC/USD', '5m');
    await tick ();
    assert.deepEqual (sent[0]['params'], { 'channel': 'ohlc', 'symbol': [ 'BTC/USD' ], 'interval': 5 }, 'ohlcv: unsubscribe request');
    // an ack for another market and interval must not settle this unwatch or drop its cache
    exchange.handleMessage (client, ack ({ 'channel': 'ohlc', 'interval': 1, 'symbol': 'XRP/USD' }));
    assert ('5m' in exchange.ohlcvs['BTC/USD'], 'ohlcv: unrelated ack leaves the 5m cache');
    exchange.handleMessage (client, ack ({ 'channel': 'ohlc', 'interval': 5, 'symbol': 'BTC/USD' }));
    assert.strictEqual (await unWatching, true, 'ohlcv: unWatchOHLCV resolves on the ack');
    assert.deepEqual (Object.keys (exchange.ohlcvs['BTC/USD']), [ '1m' ], 'ohlcv: only the acked timeframe cache released');
}

async function testKrakenUnWatchCache () {
    await testTrades ();
    await testOHLCV ();
}

export default testKrakenUnWatchCache;
