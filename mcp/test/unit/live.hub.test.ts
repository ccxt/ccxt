import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LiveHub, selectCandles, timeframeMs, LIVE_CHART_LATEST, type LiveOptions, type LiveBackend } from '../../ts/live/hub.js';
import { ToolError } from '../../ts/errors.js';
import { FakeWs, FakeRest, wsControl, candle, candles, until, NetworkError, NotSupported, MINUTE, T0, type WsControl } from '../helpers/fake-live.js';

// The shared market-data hub (ts/live/hub.ts) against a fake ccxt.pro exchange: no network.

interface Setup {
    hub: LiveHub;
    rest: FakeRest;
    ws: WsControl;
    clock: { now: number };
    backend: LiveBackend & { errors: any[], admitted: number };
}

function setup (options: Partial<LiveOptions> = {}, backendExtra: Partial<LiveBackend> = {}): Setup {
    const ws = wsControl ();
    const rest = new FakeRest ();
    const clock = { 'now': T0 + 10 * MINUTE };
    const backend: any = {
        'errors': [],
        'admitted': 0,
        'openStreamInstance': (exchangeId: string, marketType: string | undefined) => new FakeWs (ws, exchangeId, marketType),
        'reportStreamError': (_exchangeId: string, error: any) => backend.errors.push (error),
        ...backendExtra,
    };
    const hub = new LiveHub (backend, { 'sweepIntervalMs': 0, 'statsIntervalMs': 0, ...options }, () => clock.now);
    return { hub, rest, ws, clock, backend };
}

const chart = (extra: Record<string, any> = {}) => ({ 'view': 'chart' as const, 'exchangeId': 'fakex', 'symbol': 'BTC/USDT', 'timeframe': '1m', ...extra });

// polls until the hub answers from its stream
async function servedFromStream (hub: LiveHub, request: any, rest: FakeRest): Promise<any> {
    let served: any;
    const started = Date.now ();
    while (Date.now () - started < 2000) {
        served = await hub.serve (request, rest);
        if (served.source === 'stream') {
            return served;
        }
        await new Promise ((resolve) => setTimeout (resolve, 5));
    }
    throw new Error ('never served from the stream: ' + JSON.stringify (served?.source));
}

test ('live hub: timeframes and candle selection', () => {
    assert.equal (timeframeMs ('1m'), 60000);
    assert.equal (timeframeMs ('4h'), 4 * 3600000);
    assert.equal (timeframeMs ('1M'), 2592000000);
    assert.equal (timeframeMs ('nope'), undefined);
    const rows = candles (0, 9);
    const now = rows[9][0] + 30000;
    // the open candle (since) and everything after it
    assert.deepEqual (selectCandles (rows, rows[7][0], MINUTE, now), rows.slice (7));
    // a gap before since: the stream starts after the view's last candle
    assert.equal (selectCandles (rows.slice (5), rows[2][0], MINUTE, now), undefined);
    // since missing, or more than 50 candles back: the latest 200, which a short window lacks
    assert.equal (selectCandles (rows, undefined, MINUTE, now), undefined);
    assert.equal (selectCandles (rows, rows[9][0] - 60 * MINUTE, MINUTE, now), undefined);
    const long = candles (0, 299);
    assert.deepEqual (selectCandles (long, undefined, MINUTE, long[299][0]), long.slice (-LIVE_CHART_LATEST));
});

test ('live hub: the first poll is served from REST while the stream opens; later polls from the stream, with no REST call', async () => {
    const { hub, rest, ws } = setup ();
    ws.data.set ('ohlcv|BTC/USDT|1m', candles (290, 299));
    const first = await hub.serve (chart ({ 'since': candle (297)[0] }), rest);
    assert.equal (first.source, 'rest');
    assert.equal (rest.restCalls (), 1);
    assert.deepEqual (first.candles?.map ((row) => row[0]), [ 297, 298, 299 ].map ((i) => candle (i)[0]));
    assert.equal (first.nextPollMs, 5000, 'REST cadence');
    const live = await servedFromStream (hub, chart ({ 'since': candle (297)[0] }), rest);
    const restCalls = rest.restCalls ();
    assert.equal (live.nextPollMs, 2000, 'stream cadence');
    // the open candle moved and a new one arrived: the view gets the open one replaced and the new one appended
    ws.data.set ('ohlcv|BTC/USDT|1m', [ ...candles (290, 298), candle (299, 555), candle (300) ]);
    let update: any;
    const started = Date.now ();
    do {
        update = await hub.serve (chart ({ 'since': candle (299)[0] }), rest);
        await new Promise ((resolve) => setTimeout (resolve, 5));
    } while (update.candles.length < 2 && Date.now () - started < 2000);
    assert.equal (update.source, 'stream');
    assert.deepEqual (update.candles, [ candle (299, 555), candle (300) ]);
    assert.equal (rest.restCalls (), restCalls, 'polls served from the stream never call REST');
    assert.equal (hub.stats ().streams, 1);
    await hub.close ();
});

test ('live hub: since before the stream window, or missing, goes to REST (latest 200)', async () => {
    const { hub, rest, ws } = setup ();
    ws.data.set ('ohlcv|BTC/USDT|1m', candles (295, 299));
    await servedFromStream (hub, chart ({ 'since': candle (298)[0] }), rest);
    const before = rest.restCalls ();
    const gap = await hub.serve (chart ({ 'since': candle (280)[0] }), rest);
    assert.equal (gap.source, 'rest');
    assert.equal (gap.candles?.[0][0], candle (280)[0]);
    const latest = await hub.serve (chart (), rest);
    assert.equal (latest.source, 'rest');
    assert.equal (latest.candles?.length, 200);
    assert.equal (rest.calls.slice (before).length, 2);
    assert.deepEqual (rest.calls[rest.calls.length - 1].args, [ 'BTC/USDT', '1m', undefined, 200 ]);
    await hub.close ();
});

test ('live hub: leases — each poll renews; an unpolled stream is closed (unWatch while the instance has others, close with the last)', async () => {
    const { hub, rest, ws, clock } = setup ({ 'idleMs': 60000 });
    ws.data.set ('ohlcv|BTC/USDT|1m', candles (290, 299));
    ws.data.set ('orderbook|BTC/USDT', { 'bids': [ [ 99, 1 ] ], 'asks': [ [ 101, 1 ] ], 'timestamp': 1 });
    await servedFromStream (hub, chart ({ 'since': candle (299)[0] }), rest);
    await servedFromStream (hub, { 'view': 'orderbook', 'exchangeId': 'fakex', 'symbol': 'BTC/USDT', 'depth': 5 }, rest);
    assert.equal (hub.stats ().streams, 2);
    assert.equal (ws.instances.length, 1, 'one WebSocket instance per (exchange, market type)');
    clock.now += 40000;
    await hub.serve (chart ({ 'since': candle (299)[0] }), rest); // renews the chart only
    clock.now += 30000;
    assert.equal (hub.sweep (), 1, 'the order book lease ran out');
    assert.deepEqual (ws.unwatched, [ 'orderbook|BTC/USDT' ]);
    assert.equal (ws.instances[0].closed, false, 'the chart still uses the instance');
    clock.now += 61000;
    assert.equal (hub.sweep (), 1);
    assert.equal (ws.instances[0].closed, true, 'the last stream closes the instance');
    assert.equal (hub.stats ().streams, 0);
    assert.equal (hub.stats ().instances, 0);
    await hub.close ();
});

test ('live hub: caps — at the global or per-exchange cap a poll is served from REST and told to wait longer', async () => {
    const { hub, rest, ws } = setup ({ 'maxStreams': 1 });
    ws.data.set ('ticker|BTC/USDT', { 'symbol': 'BTC/USDT', 'last': 5 });
    await servedFromStream (hub, { 'view': 'tickers', 'exchangeId': 'fakex', 'symbols': [ 'BTC/USDT' ] }, rest);
    const capped = await hub.serve ({ 'view': 'orderbook', 'exchangeId': 'fakex', 'symbol': 'ETH/USDT', 'depth': 10 }, rest);
    assert.equal (capped.source, 'rest');
    assert.ok (capped.nextPollMs >= 10000, 'longer cadence at the cap: ' + capped.nextPollMs);
    assert.equal (hub.stats ().streams, 1);
    assert.equal (hub.stats ().fallbacks.cap, 1);
    await hub.close ();
    const perExchange = setup ({ 'maxStreamsPerExchange': 1 });
    await perExchange.hub.serve ({ 'view': 'orderbook', 'exchangeId': 'fakex', 'symbol': 'BTC/USDT', 'depth': 10 }, perExchange.rest);
    await perExchange.hub.serve ({ 'view': 'orderbook', 'exchangeId': 'fakex', 'symbol': 'ETH/USDT', 'depth': 10 }, perExchange.rest);
    await perExchange.hub.serve ({ 'view': 'orderbook', 'exchangeId': 'other', 'symbol': 'ETH/USDT', 'depth': 10 }, perExchange.rest);
    assert.deepEqual (perExchange.hub.stats ().streamsByExchange, { 'fakex': 1, 'other': 1 });
    await perExchange.hub.close ();
});

test ('live hub: a refused stream open (breaker, open rate) is served from REST', async () => {
    const { hub, rest } = setup ({}, { 'admitStream': () => 'breaker' });
    const served = await hub.serve ({ 'view': 'orderbook', 'exchangeId': 'fakex', 'symbol': 'BTC/USDT', 'depth': 3 }, rest);
    assert.equal (served.source, 'rest');
    assert.equal (hub.stats ().streams, 0);
    assert.equal (hub.stats ().fallbacks.refused, 1);
    await hub.close ();
});

test ('live hub: repeated WebSocket failures pause streaming on that exchange (REST meanwhile), then it streams again', async () => {
    const { hub, rest, ws, clock, backend } = setup ({ 'wsFailureThreshold': 2, 'wsCooldownMs': 300000 });
    ws.data.set ('orderbook|BTC/USDT', { 'bids': [ [ 99, 1 ] ], 'asks': [ [ 101, 1 ] ], 'timestamp': 1 });
    ws.fail = () => new NetworkError ('socket hang');
    const request = { 'view': 'orderbook' as const, 'exchangeId': 'fakex', 'symbol': 'BTC/USDT', 'depth': 3 };
    await hub.serve (request, rest);
    await until (() => hub.stats ().disabledExchanges.includes ('fakex'), 5000);
    assert.ok (backend.errors.length >= 2, 'stream errors are reported to the deployment (its breaker)');
    assert.equal (hub.stats ().streams, 0, 'its streams are closed');
    const paused = await hub.serve (request, rest);
    assert.equal (paused.source, 'rest');
    assert.equal (hub.stats ().streams, 0, 'no stream opens during the cooldown');
    assert.ok ((hub.stats ().fallbacks.disabled ?? 0) >= 1);
    ws.fail = undefined;
    clock.now += 300001;
    await servedFromStream (hub, request, rest);
    assert.deepEqual (hub.stats ().disabledExchanges, []);
    await hub.close ();
});

test ('live hub: a channel the exchange does not stream (NotSupported, no watch method) stays on REST without counting as a failure', async () => {
    const { hub, rest, ws, backend } = setup ();
    ws.fail = (method) => ((method === 'watchOHLCV') ? new NotSupported ('only 5m') : undefined);
    ws.data.set ('ohlcv|BTC/USDT|1m', candles (290, 299));
    await hub.serve (chart (), rest);
    await until (() => hub.stats ().streams === 0);
    const again = await hub.serve (chart (), rest);
    assert.equal (again.source, 'rest');
    assert.equal (hub.stats ().streams, 0, 'not reopened while marked unsupported');
    assert.equal (backend.errors.length, 0);
    assert.deepEqual (hub.stats ().disabledExchanges, []);
    await hub.close ();
    // an exchange without a WebSocket implementation at all
    const none = setup ({}, { 'openStreamInstance': () => undefined });
    await none.hub.serve (chart (), none.rest);
    await until (() => none.hub.stats ().streams === 0);
    assert.equal ((await none.hub.serve (chart (), none.rest)).source, 'rest');
    await none.hub.close ();
});

test ('live hub: order book depth and a tickers subset', async () => {
    const { hub, rest, ws } = setup ();
    const book = { 'bids': Array.from ({ 'length': 40 }, (_, i) => [ 99 - i, 1 ]), 'asks': Array.from ({ 'length': 40 }, (_, i) => [ 101 + i, 1 ]), 'timestamp': 1700000000123 };
    ws.data.set ('orderbook|BTC/USDT', book);
    const served = await servedFromStream (hub, { 'view': 'orderbook', 'exchangeId': 'fakex', 'symbol': 'BTC/USDT', 'depth': 7 }, rest);
    assert.equal (served.book?.bids.length, 7);
    assert.equal (served.book?.asks.length, 7);
    assert.deepEqual (served.book?.bids[0], [ 99, 1 ]);
    assert.equal (served.book?.timestamp, 1700000000123);
    // REST asks for one fixed depth (a limit every venue accepts, one cache entry per symbol) and slices
    const rested = await hub.serve ({ 'view': 'orderbook', 'exchangeId': 'fakex', 'symbol': 'ETH/USDT', 'depth': 4 }, rest);
    assert.equal (rested.book?.bids.length, 4);
    assert.deepEqual (rest.calls.filter ((call) => call.method === 'fetchOrderBook').pop ()?.args, [ 'ETH/USDT', 100 ]);
    ws.data.set ('ticker|BTC/USDT', { 'symbol': 'BTC/USDT', 'last': 7 });
    ws.data.set ('ticker|ETH/USDT', { 'symbol': 'ETH/USDT', 'last': 8 });
    ws.data.set ('ticker|SOL/USDT', { 'symbol': 'SOL/USDT', 'last': 9 });
    const tickers = await servedFromStream (hub, { 'view': 'tickers', 'exchangeId': 'fakex', 'symbols': [ 'BTC/USDT', 'ETH/USDT' ] }, rest);
    assert.deepEqual (Object.keys (tickers.tickers ?? {}).sort (), [ 'BTC/USDT', 'ETH/USDT' ]);
    assert.equal (tickers.tickers?.['ETH/USDT'].last, 8);
    // a partly streamed board fetches only the missing symbols over REST
    const mixed = await hub.serve ({ 'view': 'tickers', 'exchangeId': 'fakex', 'symbols': [ 'BTC/USDT', 'SOL/USDT' ] }, rest);
    assert.equal (mixed.source, 'rest');
    assert.deepEqual (rest.calls[rest.calls.length - 1], { 'method': 'fetchTicker', 'args': [ 'SOL/USDT' ] }, 'one missing symbol: one fetchTicker');
    assert.deepEqual (Object.keys (mixed.tickers ?? {}).sort (), [ 'BTC/USDT', 'SOL/USDT' ]);
    await hub.close ();
});

test ('live hub: errors — guard errors pass through, anything else is LIVE_UNAVAILABLE, stale stream data beats an error', async () => {
    const { hub, rest, ws, clock } = setup ({ 'staleMs': 10000 });
    rest.fail = () => new ToolError ('RATE_LIMITED', 'busy', { 'retryable': true, 'retryAfterSeconds': 3 });
    await assert.rejects (hub.serve (chart (), rest), (error: any) => error.code === 'RATE_LIMITED');
    rest.fail = () => new NetworkError ('down');
    await assert.rejects (hub.serve ({ 'view': 'orderbook', 'exchangeId': 'fakex', 'symbol': 'ETH/USDT', 'depth': 3 }, rest), (error: any) => error.code === 'LIVE_UNAVAILABLE' && error.retryAfterSeconds > 0);
    rest.fail = undefined;
    ws.data.set ('orderbook|BTC/USDT', { 'bids': [ [ 99, 1 ] ], 'asks': [ [ 101, 1 ] ], 'timestamp': 1 });
    const request = { 'view': 'orderbook' as const, 'exchangeId': 'fakex', 'symbol': 'BTC/USDT', 'depth': 3 };
    await servedFromStream (hub, request, rest);
    // the socket goes quiet: after staleMs the data is not served while REST works ...
    ws.data.delete ('orderbook|BTC/USDT');
    await new Promise ((resolve) => setTimeout (resolve, 20));
    clock.now += 20000;
    assert.equal ((await hub.serve (request, rest)).source, 'rest');
    // ... but when REST fails too, the stale book is better than an error, polled less often
    rest.fail = () => new NetworkError ('down');
    const stale = await hub.serve (request, rest);
    assert.equal (stale.source, 'stream');
    assert.ok (stale.nextPollMs >= 4000);
    await hub.close ();
});

test ('live hub: streaming off serves everything from REST; close () stops every stream and instance', async () => {
    const off = setup ({ 'enabled': false });
    off.ws.data.set ('ohlcv|BTC/USDT|1m', candles (290, 299));
    assert.equal ((await off.hub.serve (chart (), off.rest)).source, 'rest');
    assert.equal (off.ws.instances.length, 0);
    await off.hub.close ();
    const { hub, rest, ws } = setup ();
    ws.data.set ('ohlcv|BTC/USDT|1m', candles (290, 299));
    ws.data.set ('ticker|ETH/USDT', { 'symbol': 'ETH/USDT', 'last': 1 });
    await servedFromStream (hub, chart ({ 'since': candle (299)[0] }), rest);
    await servedFromStream (hub, { 'view': 'tickers', 'exchangeId': 'fakex', 'marketType': 'swap', 'symbols': [ 'ETH/USDT' ] }, rest);
    assert.equal (ws.instances.length, 2, 'one instance per market type');
    await hub.close ();
    assert.equal (hub.stats ().streams, 0);
    assert.ok (ws.instances.every ((instance) => instance.closed));
    const watchCalls = ws.watchCalls;
    await new Promise ((resolve) => setTimeout (resolve, 30));
    assert.ok (ws.watchCalls - watchCalls <= 2, 'no loop keeps running after close');
    // a closed hub still answers, from REST
    assert.equal ((await hub.serve (chart (), rest)).source, 'rest');
});

test ('live hub: nextPollMs honours the deployment floor and load factor, always within 1-30 s', async () => {
    const { hub, rest } = setup ({ 'enabled': false }, { 'restPollMs': () => 60000, 'loadFactor': () => 1 });
    assert.equal ((await hub.serve (chart (), rest)).nextPollMs, 30000);
    await hub.close ();
    const loaded = setup ({ 'enabled': false }, { 'loadFactor': () => 2 });
    assert.equal ((await loaded.hub.serve (chart (), loaded.rest)).nextPollMs, 10000);
    await loaded.hub.close ();
});

test ('live hub: periodic stats are logged only while there is activity', async () => {
    const lines: any[] = [];
    const { hub, rest } = setup ({ 'enabled': false }, { 'log': (level, message, attributes) => lines.push ({ level, message, attributes }) });
    hub.logStats ();
    assert.equal (lines.length, 0);
    await hub.serve (chart (), rest);
    hub.logStats ();
    hub.logStats ();
    const stats = lines.filter ((line) => line.message === 'live hub stats');
    assert.equal (stats.length, 1);
    assert.equal (stats[0].level, 'info');
    assert.equal (stats[0].attributes.polls_rest, 1);
    await hub.close ();
});
