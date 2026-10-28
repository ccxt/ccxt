import assert from 'assert';
import { BadRequest, NetworkError, UnsubscribeError } from '../../../base/errors.js';
import ccxt from '../../../../ccxt.js';

// NO_AUTO_TRANSPILE
// native ts test, intentionally not transpiled - lbank does not acknowledge an
// unsubscribe (it just stops streaming the channel), so unWatchTrades / unWatchOHLCV
// clean up as soon as the request is sent, and only send it for a channel that is
// subscribed. the static ws fixtures start from a fresh exchange and can only reach
// the nothing-subscribed branch; this test drives watch* first, then unWatch*, over a
// mocked transport, and checks the frames sent, the caches and the subscriptions

function spotMarket (base: string) {
    const id = base.toLowerCase () + '_usdt';
    return {
        'id': id,
        'symbol': base + '/USDT',
        'base': base,
        'quote': 'USDT',
        'baseId': base.toLowerCase (),
        'quoteId': 'usdt',
        'type': 'spot',
        'spot': true,
        'margin': false,
        'swap': false,
        'future': false,
        'option': false,
        'contract': false,
        'active': true,
        'precision': { 'amount': 0.0001, 'price': 0.01 },
        'limits': {},
    };
}

function sleep (ms: number) {
    return new Promise ((resolve) => setTimeout (resolve, ms));
}

async function waitForSent (client: any, count: number) {
    // subscribe frames go through the client's rate-limit throttle, so they
    // leave one by one rather than synchronously
    let waited = 0;
    while ((client.sent.length < count) && (waited < 5000)) {
        await sleep (10);
        waited = waited + 10;
    }
}

function makeOfflineLbank () {
    const exchange = new ccxt.pro.lbank ();
    exchange.setMarkets ([ spotMarket ('BTC'), spotMarket ('ETH') ]);
    // same shape as setupWsMockTransport in ts/src/test/tests.helpers.ts: an
    // "already connected" client whose transport records every frame sent
    const url = exchange.urls['api']['ws'];
    const client: any = exchange.client (url);
    client.startedConnecting = true;
    client.isConnected = true;
    client.connectionEstablished = exchange.milliseconds ();
    client.sent = [];
    client.connection = {
        'readyState': 1,
        'send': (message: any, options: any = undefined, callback: any = undefined) => {
            client.sent.push (JSON.parse (message));
            if (callback !== undefined) {
                callback ();
            }
        },
        'close': () => {},
    };
    client.connected.resolve (url);
    return [ exchange, client ];
}

function tradeFrame (pair: string) {
    return {
        'trade': { 'volume': 0.01, 'amount': 600.5, 'price': 60050, 'direction': 'buy', 'TS': '2026-10-28T10:00:00.000' },
        'type': 'trade',
        'pair': pair,
        'SERVER': 'V2',
        'TS': '2026-10-28T10:00:00.010',
    };
}

function kbarFrame (pair: string) {
    return {
        'SERVER': 'V2',
        'kbar': { 'a': 600.5, 'c': 60050, 't': '2026-10-28T10:00:00.000', 'v': 0.01, 'h': 60060, 'slot': '1min', 'l': 60040, 'n': 1, 'o': 60045 },
        'type': 'kbar',
        'pair': pair,
        'TS': '2026-10-28T10:00:00.010',
    };
}

async function settle (promise: Promise<any>) {
    try {
        return { 'value': await promise, 'error': undefined };
    } catch (e) {
        return { 'value': undefined, 'error': e };
    }
}

async function testUnWatchSubscribed () {
    const [ exchange, client ] = makeOfflineLbank () as any;
    // subscribe and fill the caches
    const watching = [
        exchange.watchTrades ('BTC/USDT'),
        exchange.watchTrades ('ETH/USDT'),
        exchange.watchOHLCV ('BTC/USDT', '1m'),
    ];
    await waitForSent (client, 3);
    exchange.handleMessage (client, tradeFrame ('btc_usdt'));
    exchange.handleMessage (client, tradeFrame ('eth_usdt'));
    exchange.handleMessage (client, kbarFrame ('btc_usdt'));
    await Promise.all (watching);
    assert (client.sent.length === 3, 'three subscribe frames expected, got ' + JSON.stringify (client.sent));
    assert ('BTC/USDT' in exchange.trades && 'ETH/USDT' in exchange.trades, 'both trade caches must be filled');
    assert ('1m' in exchange.ohlcvs['BTC/USDT'], 'the 1m ohlcv cache must be filled');
    // a watcher still waiting for the next trade / candle when the unWatch lands
    const pendingTrades = settle (exchange.watchTrades ('BTC/USDT'));
    const pendingOHLCV = settle (exchange.watchOHLCV ('BTC/USDT', '1m'));
    await sleep (10);
    client.sent = [];
    // unWatchTrades
    const tradesResult = await exchange.unWatchTrades ('BTC/USDT');
    assert (tradesResult === true, 'unWatchTrades must resolve true without an acknowledgement');
    assert.deepStrictEqual (client.sent, [ { 'action': 'unsubscribe', 'subscribe': 'trade', 'pair': 'btc_usdt' } ]);
    const tradesOutcome = await pendingTrades;
    assert (tradesOutcome['error'] instanceof UnsubscribeError, 'the pending watchTrades must be rejected with UnsubscribeError');
    assert (!('trades:BTC/USDT' in client.subscriptions), 'the btc trades subscription must be dropped');
    assert (!('BTC/USDT' in exchange.trades), 'the btc trades cache must be dropped');
    assert ('trades:ETH/USDT' in client.subscriptions, 'the eth trades subscription must stay');
    assert ('ETH/USDT' in exchange.trades, 'the eth trades cache must stay');
    assert (!('unsubscribe:trades:BTC/USDT' in client.subscriptions) && !('unsubscribe:trades:BTC/USDT' in client.futures), 'nothing must be left waiting for an acknowledgement');
    // unWatchOHLCV
    client.sent = [];
    const ohlcvResult = await exchange.unWatchOHLCV ('BTC/USDT', '1m');
    assert (ohlcvResult === true, 'unWatchOHLCV must resolve true without an acknowledgement');
    assert.deepStrictEqual (client.sent, [ { 'action': 'unsubscribe', 'subscribe': 'kbar', 'kbar': '1min', 'pair': 'btc_usdt' } ]);
    const ohlcvOutcome = await pendingOHLCV;
    assert (ohlcvOutcome['error'] instanceof UnsubscribeError, 'the pending watchOHLCV must be rejected with UnsubscribeError');
    assert (!('ohlcv:BTC/USDT:1min' in client.subscriptions), 'the btc 1m kbar subscription must be dropped');
    assert (!('1m' in exchange.ohlcvs['BTC/USDT']), 'the btc 1m ohlcv cache must be dropped');
    // frames lbank pushed before it processed the unsubscribe can still arrive - they must not refill the caches
    exchange.handleMessage (client, tradeFrame ('btc_usdt'));
    exchange.handleMessage (client, kbarFrame ('btc_usdt'));
    exchange.handleMessage (client, tradeFrame ('eth_usdt'));
    assert (!('BTC/USDT' in exchange.trades), 'a late btc trade must not refill the dropped cache');
    assert (!('1m' in exchange.ohlcvs['BTC/USDT']), 'a late btc candle must not refill the dropped cache');
    assert (exchange.trades['ETH/USDT'].length === 2, 'eth trades must keep flowing');
    // a second unWatch for the same channel sends nothing
    client.sent = [];
    assert ((await exchange.unWatchTrades ('BTC/USDT')) === true, 'a repeated unWatchTrades must resolve true');
    assert ((await exchange.unWatchOHLCV ('BTC/USDT', '1m')) === true, 'a repeated unWatchOHLCV must resolve true');
    assert (client.sent.length === 0, 'nothing is subscribed any more, so nothing must be sent, got ' + JSON.stringify (client.sent));
    // watching again subscribes again
    const rewatch = exchange.watchTrades ('BTC/USDT');
    await waitForSent (client, 1);
    assert.deepStrictEqual (client.sent, [ { 'action': 'subscribe', 'subscribe': 'trade', 'pair': 'btc_usdt' } ]);
    exchange.handleMessage (client, tradeFrame ('btc_usdt'));
    const trades = await rewatch;
    assert (trades.length === 1, 'the re-watched channel must deliver trades again');
}

async function testUnWatchWhileConnecting () {
    // the watch registered its subscription but the socket is still opening, so its
    // subscribe frame has not been sent yet: the unsubscribe cannot be sent either, and
    // the subscription must be kept rather than left to stream unwatched once it opens
    const exchange = new ccxt.pro.lbank ();
    exchange.setMarkets ([ spotMarket ('BTC') ]);
    const client: any = exchange.client (exchange.urls['api']['ws']);
    client.subscriptions['trades:BTC/USDT'] = true;
    client.connection = {
        'readyState': 0,
        'send': () => {
            throw new Error ('WebSocket is not open: readyState 0 (CONNECTING)');
        },
        'close': () => {},
    };
    let error = undefined;
    try {
        await exchange.unWatchTrades ('BTC/USDT');
    } catch (e) {
        error = e;
    }
    assert (error instanceof NetworkError, 'unWatchTrades on a socket that is not open must throw NetworkError, got ' + String (error));
    assert ('trades:BTC/USDT' in client.subscriptions, 'the subscription must be kept when the unsubscribe could not be sent');
}

async function testUnWatchOHLCVUnsupportedTimeframe () {
    const [ exchange, client ] = makeOfflineLbank () as any;
    let error = undefined;
    try {
        await exchange.unWatchOHLCV ('BTC/USDT', '2m');
    } catch (e) {
        error = e;
    }
    assert (error instanceof BadRequest, 'an unsupported timeframe must throw BadRequest');
    assert (client.sent.length === 0, 'an unsupported timeframe must send nothing');
}

async function testLbankUnWatch () {
    await testUnWatchSubscribed ();
    await testUnWatchWhileConnecting ();
    await testUnWatchOHLCVUnsupportedTimeframe ();
}

export default testLbankUnWatch;
