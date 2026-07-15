// Times loadMarkets + fetchTrades for binance, mirroring the Rust CLI's
// `--time` instrumentation so the two ports can be compared head-to-head.
//
// In TS the `fetch` method swallows the network roundtrip AND the JSON
// parse; we can't cleanly separate them without monkey-patching node-fetch,
// so we report the combined http+json number — Rust's CLI reports it as
// `http + json` (so add those two columns when comparing).

import ccxt from './ts/ccxt.js';

async function main () {
    const ex: any = new (ccxt as any).binance ({
        // no creds, public endpoints only
        'enableRateLimit': false,
    });

    let httpMs = 0;
    let httpCalls = 0;
    const origFetch = ex.fetch.bind (ex);
    ex.fetch = async (...args: any[]) => {
        const t = performance.now ();
        const r = await origFetch (...args);
        httpMs += performance.now () - t;
        httpCalls += 1;
        return r;
    };

    // ── loadMarkets ──
    httpMs = 0; httpCalls = 0;
    const t0 = performance.now ();
    await ex.loadMarkets ();
    const loadTotal = performance.now () - t0;
    const loadHttp  = httpMs;
    const loadCalls = httpCalls;

    // ── fetchTrades ──
    httpMs = 0; httpCalls = 0;
    const t1 = performance.now ();
    await ex.fetchTrades ('BTC/USDT');
    const methodTotal = performance.now () - t1;
    const mHttp  = httpMs;
    const mCalls = httpCalls;
    const mParse = methodTotal - mHttp;

    const fmt = (n: number) => n.toFixed (2).padStart (8);
    console.error ();
    console.error ('timings (ms):');
    console.error (`  loadMarkets:    total=${fmt (loadTotal)}  http+json=${fmt (loadHttp)}  calls=${loadCalls}`);
    console.error (`  fetchTrades:    total=${fmt (methodTotal)}  http+json=${fmt (mHttp)}  parse=${fmt (mParse)}  calls=${mCalls}`);
}

main ().catch ((e) => { console.error ('error:', e); process.exit (1); });
