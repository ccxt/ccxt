// Probes how far back each exchange serves public history through ccxt's unified API,
// and which historical data types it exposes.
//
// Usage:  node probe-history-depth.mjs [exchange,exchange,...]   (run from the ccxt repo, after npm ci)
//
// For each data type it binary-searches the earliest timestamp t for which
// fetchX(symbol, since = t, limit = small) returns rows starting close to t. An exchange that
// ignores `since` and always returns the latest rows is therefore reported with the start of
// what it actually serves (e.g. "last 720 candles"), which is what a backfill can rely on.
// Resolution is one day. Results are written to history-depth.json.

import ccxt from '../../js/ccxt.js';
import fs from 'node:fs';

const DAY = 86400000;
const EPOCH = Date.UTC (2010, 0, 1);
const NOW = Date.now ();
const wanted = (process.argv[2] ?? 'binance,binanceusdm,okx,bybit,coinbase,kraken,krakenfutures,gate,bitget,kucoin,kucoinfutures,htx,mexc,bitfinex,deribit,hyperliquid').split (',');

const SPOT = [ 'BTC/USDT', 'BTC/USD', 'BTC/USDC' ];
const PERP = [ 'BTC/USDT:USDT', 'BTC/USD:USD', 'BTC/USD:BTC', 'BTC/USDC:USDC' ];

function pick (ex, candidates, type) {
    for (const s of candidates) {
        const m = ex.markets[s];
        if (m && m.active !== false && (type === undefined || m.type === type)) {
            return s;
        }
    }
    return undefined;
}

// does the exchange serve data at time t?  fetcher (t) returns rows with timestamps (ms)
async function servesAt (fetcher, t, window) {
    try {
        const rows = await fetcher (t);
        if (!rows || rows.length === 0) {
            return false;
        }
        const first = Math.min (...rows.map ((r) => r.ts));
        return first >= t - window && first <= t + window;
    } catch (e) {
        return false;
    }
}

async function earliest (fetcher, window) {
    // newest probe first: if nothing is served a week ago, the type is effectively live-only
    if (!(await servesAt (fetcher, NOW - 7 * DAY, window))) {
        return { earliest: undefined, note: 'nothing at now-7d (since ignored, or no history)' };
    }
    let lo = EPOCH, hi = NOW - 7 * DAY;     // invariant: serves at hi
    if (await servesAt (fetcher, lo, window)) {
        return { earliest: lo, note: 'serves at 2010-01-01 (lower bound of probe)' };
    }
    let calls = 2;
    while (hi - lo > DAY) {
        const mid = lo + Math.floor ((hi - lo) / 2);
        if (await servesAt (fetcher, mid, window)) {
            hi = mid;
        } else {
            lo = mid;
        }
        calls += 1;
    }
    return { earliest: hi, calls };
}

const iso = (t) => (t === undefined ? null : new Date (t).toISOString ().slice (0, 10));
const yearsBack = (t) => (t === undefined ? null : Number (((NOW - t) / (365.25 * DAY)).toFixed (1)));

async function probeExchange (id) {
    const ex = new ccxt[id] ({ enableRateLimit: true, timeout: 20000, httpsProxy: process.env.HTTPS_PROXY });   // undefined when no proxy
    const out = { exchange: id, has: {}, symbols: {}, history: {}, orderBookLevels: {}, errors: [] };
    try {
        await ex.loadMarkets ();
    } catch (e) {
        out.errors.push ('loadMarkets: ' + String (e.message).slice (0, 160));
        return out;
    }
    for (const k of [ 'fetchOHLCV', 'fetchTrades', 'fetchFundingRateHistory', 'fetchOpenInterestHistory', 'fetchMarkOHLCV', 'fetchIndexOHLCV', 'fetchPremiumIndexOHLCV', 'fetchLiquidations', 'fetchOrderBook' ]) {
        out.has[k] = ex.has[k] ?? false;
    }
    out.ohlcvTimeframes = ex.timeframes ? Object.keys (ex.timeframes) : [];
    const spot = pick (ex, SPOT, 'spot');
    const perp = pick (ex, PERP, 'swap');
    out.symbols = { spot, perp };
    const targets = [];
    if (spot) targets.push ([ 'spot', spot ]);
    if (perp) targets.push ([ 'perp', perp ]);
    for (const [ kind, symbol ] of targets) {
        const h = {};
        if (ex.has['fetchOHLCV']) {
            for (const [ tf, window ] of [ [ '1d', 31 * DAY ], [ '1h', 7 * DAY ], [ '1m', 1 * DAY ] ]) {
                if (ex.timeframes && !(tf in ex.timeframes)) {
                    continue;
                }
                const r = await earliest (async (t) => (await ex.fetchOHLCV (symbol, tf, t, 5)).map ((c) => ({ ts: c[0] })), window);
                h['ohlcv_' + tf] = { earliest: iso (r.earliest), yearsBack: yearsBack (r.earliest), note: r.note };
            }
        }
        if (ex.has['fetchTrades']) {
            const r = await earliest (async (t) => (await ex.fetchTrades (symbol, t, 5)).map ((x) => ({ ts: x.timestamp })), 2 * DAY);
            h.trades = { earliest: iso (r.earliest), yearsBack: yearsBack (r.earliest), note: r.note };
        }
        if (kind === 'perp' && ex.has['fetchFundingRateHistory']) {
            const r = await earliest (async (t) => (await ex.fetchFundingRateHistory (symbol, t, 5)).map ((x) => ({ ts: x.timestamp })), 3 * DAY);
            h.funding = { earliest: iso (r.earliest), yearsBack: yearsBack (r.earliest), note: r.note };
        }
        if (kind === 'perp' && ex.has['fetchOpenInterestHistory']) {
            const r = await earliest (async (t) => (await ex.fetchOpenInterestHistory (symbol, '1h', t, 5)).map ((x) => ({ ts: x.timestamp })), 7 * DAY);
            h.openInterest_1h = { earliest: iso (r.earliest), yearsBack: yearsBack (r.earliest), note: r.note };
        }
        if (kind === 'perp' && ex.has['fetchMarkOHLCV']) {
            const r = await earliest (async (t) => (await ex.fetchMarkOHLCV (symbol, '1h', t, 5)).map ((c) => ({ ts: c[0] })), 7 * DAY);
            h.markOhlcv_1h = { earliest: iso (r.earliest), yearsBack: yearsBack (r.earliest), note: r.note };
        }
        out.history[kind] = h;
        if (ex.has['fetchOrderBook']) {
            let levels;
            for (const limit of [ 5000, 1000, 500, 400, 200, 100, 50, undefined ]) {
                try {
                    const ob = await ex.fetchOrderBook (symbol, limit);
                    levels = ob.bids.length + ob.asks.length;
                    break;
                } catch (e) {
                    // try a smaller limit
                }
            }
            out.orderBookLevels[kind] = levels;
        }
    }
    return out;
}

const results = await Promise.all (wanted.map ((id) => probeExchange (id).catch ((e) => ({ exchange: id, errors: [ String (e.message).slice (0, 200) ] }))));
const file = new URL ('./measurements/history-depth.json', import.meta.url);
fs.mkdirSync (new URL ('./measurements/', import.meta.url), { recursive: true });
fs.writeFileSync (file, JSON.stringify ({ probedAt: new Date (NOW).toISOString (), results }, null, 2));
for (const r of results) {
    console.log ('\n## ' + r.exchange, r.errors?.length ? r.errors : '');
    console.log (JSON.stringify ({ symbols: r.symbols, history: r.history, orderBookLevels: r.orderBookLevels }));
}
