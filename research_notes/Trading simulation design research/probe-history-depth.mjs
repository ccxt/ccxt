// Probes how far back each exchange serves public history through ccxt's unified API,
// and which historical data types it exposes, for BTC, ETH and one low-volume market of
// each type (spot and perpetual).
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


function pick (ex, candidates, type) {
    for (const s of candidates) {
        const m = ex.markets[s];
        if (m && m.active !== false && (type === undefined || m.type === type)) {
            return s;
        }
    }
    return undefined;
}

const QUOTES = [ 'USDT', 'USD', 'USDC' ];

function candidates (base, type) {
    if (type === 'spot') {
        return QUOTES.map ((q) => base + '/' + q);
    }
    return [ base + '/USDT:USDT', base + '/USD:USD', base + '/USD:' + base, base + '/USDC:USDC' ];
}

// a quiet but still trading market of the same type and quote as the reference market:
// about the 80th percentile of 24h quote volume, so ~20% of markets are quieter
async function pickLowVolume (ex, reference) {
    const ref = ex.markets[reference];
    const pool = Object.values (ex.markets).filter ((m) => m.active !== false && m.type === ref.type && m.quote === ref.quote && m.settle === ref.settle && [ 'BTC', 'ETH' ].indexOf (m.base) === -1);
    if (pool.length === 0) {
        return undefined;
    }
    let ranked;
    try {
        const tickers = await ex.fetchTickers (undefined, { 'type': ref.type, 'subType': ref.subType });
        ranked = pool.map ((m) => ({ symbol: m.symbol, vol: tickers[m.symbol]?.quoteVolume ?? (tickers[m.symbol]?.baseVolume ?? 0) * (tickers[m.symbol]?.last ?? 0) }))
            .filter ((x) => x.vol > 0).sort ((a, b) => b.vol - a.vol);
    } catch (e) {
        ranked = [];
    }
    if (ranked.length === 0) {
        const sorted = pool.map ((m) => m.symbol).sort ();
        return { symbol: sorted[Math.floor (sorted.length / 2)], rank: 'unknown (no tickers)' };
    }
    const i = Math.floor (ranked.length * 0.8);
    return { symbol: ranked[i].symbol, rank: `${i + 1} of ${ranked.length}`, quoteVolume24h: Math.round (ranked[i].vol) };
}

// does the exchange serve data at time t?  fetcher (t) returns rows with timestamps (ms)
// errors are retried with backoff; persistent errors are reported, never counted as "no data"
class ProbeError extends Error {}
const sleep = (ms) => new Promise ((res) => setTimeout (res, ms));

async function servesAt (fetcher, t, window) {
    let rows;
    for (const backoff of [ 0, 3000, 10000, 30000 ]) {
        await sleep (backoff);
        try {
            rows = await fetcher (t);
            break;
        } catch (e) {
            if (e instanceof ccxt.BadRequest || e instanceof ccxt.BadSymbol || e instanceof ccxt.NotSupported) {
                return false;     // the exchange rejected this `since`: treat as not served
            }
            rows = new ProbeError (String (e.message).slice (0, 160));
        }
    }
    if (rows instanceof ProbeError) {
        throw rows;
    }
    if (!rows || rows.length === 0) {
        return false;
    }
    const first = Math.min (...rows.map ((r) => r.ts));
    return first >= t - window && first <= t + window;
}

async function earliest (fetcher, window) {
    try {
        // newest probe first: if nothing is served a week ago, the type is effectively live-only
        if (!(await servesAt (fetcher, NOW - 7 * DAY, window))) {
            return { earliest: undefined, note: 'nothing at now-7d (since ignored, or no history)' };
        }
        let lo = EPOCH, hi = NOW - 7 * DAY;     // invariant: serves at hi
        if (await servesAt (fetcher, lo, window)) {
            return { earliest: lo, note: 'serves at 2010-01-01 (lower bound of probe)' };
        }
        while (hi - lo > DAY) {
            const mid = lo + Math.floor ((hi - lo) / 2);
            if (await servesAt (fetcher, mid, window)) {
                hi = mid;
            } else {
                lo = mid;
            }
        }
        return { earliest: hi };
    } catch (e) {
        return { earliest: undefined, error: e.message, note: 'probe error after retries' };
    }
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
    const targets = [];
    for (const [ kind, type ] of [ [ 'spot', 'spot' ], [ 'perp', 'swap' ] ]) {
        const btc = pick (ex, candidates ('BTC', type), type);
        const eth = pick (ex, candidates ('ETH', type), type);
        if (btc) targets.push ([ kind + ':BTC', btc ]);
        if (eth) targets.push ([ kind + ':ETH', eth ]);
        const low = btc ? await pickLowVolume (ex, btc) : undefined;
        if (low) {
            targets.push ([ kind + ':low', low.symbol ]);
            out.lowVolume = out.lowVolume ?? {};
            out.lowVolume[kind] = low;
        }
    }
    out.symbols = Object.fromEntries (targets);
    for (const [ label, symbol ] of targets) {
        const kind = label.split (':')[0];
        const h = {};
        if (ex.has['fetchOHLCV']) {
            for (const [ tf, window ] of [ [ '1d', 31 * DAY ], [ '1h', 7 * DAY ], [ '1m', 1 * DAY ] ]) {
                if (ex.timeframes && !(tf in ex.timeframes)) {
                    continue;
                }
                const r = await earliest (async (t) => (await ex.fetchOHLCV (symbol, tf, t, 5)).map ((c) => ({ ts: c[0] })), window);
                h['ohlcv_' + tf] = { earliest: iso (r.earliest), yearsBack: yearsBack (r.earliest), note: r.note, error: r.error };
            }
        }
        if (ex.has['fetchTrades']) {
            const r = await earliest (async (t) => (await ex.fetchTrades (symbol, t, 5)).map ((x) => ({ ts: x.timestamp })), 2 * DAY);
            h.trades = { earliest: iso (r.earliest), yearsBack: yearsBack (r.earliest), note: r.note, error: r.error };
        }
        if (kind === 'perp' && ex.has['fetchFundingRateHistory']) {
            const r = await earliest (async (t) => (await ex.fetchFundingRateHistory (symbol, t, 5)).map ((x) => ({ ts: x.timestamp })), 3 * DAY);
            h.funding = { earliest: iso (r.earliest), yearsBack: yearsBack (r.earliest), note: r.note, error: r.error };
        }
        if (kind === 'perp' && ex.has['fetchOpenInterestHistory']) {
            const r = await earliest (async (t) => (await ex.fetchOpenInterestHistory (symbol, '1h', t, 5)).map ((x) => ({ ts: x.timestamp })), 7 * DAY);
            h.openInterest_1h = { earliest: iso (r.earliest), yearsBack: yearsBack (r.earliest), note: r.note, error: r.error };
        }
        if (kind === 'perp' && ex.has['fetchMarkOHLCV']) {
            const r = await earliest (async (t) => (await ex.fetchMarkOHLCV (symbol, '1h', t, 5)).map ((c) => ({ ts: c[0] })), 7 * DAY);
            h.markOhlcv_1h = { earliest: iso (r.earliest), yearsBack: yearsBack (r.earliest), note: r.note, error: r.error };
        }
        out.history[label] = h;
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
            out.orderBookLevels[label] = levels;
        }
    }
    return out;
}

const results = await Promise.all (wanted.map ((id) => probeExchange (id).catch ((e) => ({ exchange: id, errors: [ String (e.message).slice (0, 200) ] }))));
const file = new URL ('./measurements/' + (process.argv[3] ?? 'history-depth.json'), import.meta.url);
fs.mkdirSync (new URL ('./measurements/', import.meta.url), { recursive: true });
fs.writeFileSync (file, JSON.stringify ({ probedAt: new Date (NOW).toISOString (), results }, null, 2));
for (const r of results) {
    console.log ('\n## ' + r.exchange, r.errors?.length ? r.errors : '');
    console.log (JSON.stringify ({ symbols: r.symbols, history: r.history, orderBookLevels: r.orderBookLevels }));
}
