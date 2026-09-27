// Measures how much market data Binance produces for a few symbols over a short window,
// to size a backtesting data layer (OHLCV, trades, tickers, L2 order books).
//
// Usage:  npm i ws https-proxy-agent@7
//         node measure-binance-data-volume.mjs [--minutes 10] [--symbols BTCUSDT,auto] [--market spot|usdm]
//
// "auto" picks a low-traffic USDT pair (about the 80th percentile by 24h trade count, i.e. a
// quiet but still active market). Raw WebSocket frames are what a recorder would store, so the
// script measures raw bytes, gzip and brotli sizes, and message/row counts per stream, then
// extrapolates to a day and a year. It uses the 24h trade count from the ticker to show how
// representative the 10-minute window was.

import WebSocket from 'ws';
import zlib from 'node:zlib';
import fs from 'node:fs';

const args = {};
const argv = process.argv.slice (2);
for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith ('--')) {
        args[argv[i].slice (2)] = argv[i + 1];
        i++;
    }
}
const MINUTES = Number (args.minutes ?? 10);
const MARKET = args.market ?? 'spot';
const REST = (MARKET === 'usdm') ? 'https://fapi.binance.com/fapi/v1' : 'https://api.binance.com/api/v3';
// USD-M futures split market streams across two endpoints (mirrors binance.getFutureWsCategory in ccxt pro):
// depth, bookTicker and trade on /public, everything else on /market
const futureWsCategory = (suffix) => ((suffix.startsWith ('depth') || suffix === 'bookTicker' || suffix === 'trade') ? 'public' : 'market');
const wsUrlFor = (suffix) => ((MARKET === 'usdm') ? `wss://fstream.binance.com/${futureWsCategory (suffix)}/stream?streams=` : 'wss://stream.binance.com:443/stream?streams=');
let agent;
if (process.env.HTTPS_PROXY) {
    const { HttpsProxyAgent } = await import ('https-proxy-agent');
    agent = new HttpsProxyAgent (process.env.HTTPS_PROXY);
}

async function get (path) {
    const r = await fetch (REST + path);
    if (!r.ok) throw new Error (`${r.status} ${REST + path}`);
    const text = await r.text ();
    return { text, json: JSON.parse (text) };
}

// the 24h ticker also lists halted and delisted pairs, so keep only symbols whose status is TRADING
async function tradingTickers () {
    const { json: info } = await get ((MARKET === 'usdm') ? '/exchangeInfo' : '/exchangeInfo?permissions=SPOT');
    const trading = new Set (info.symbols.filter ((x) => x.status === 'TRADING').map ((x) => x.symbol));
    const { json: all } = await get ('/ticker/24hr');
    return all.filter ((t) => trading.has (t.symbol));
}

async function pickSymbols () {
    const wanted = (args.symbols ?? 'BTCUSDT,auto').split (',');
    const all = await tradingTickers ();
    const usdt = all.filter ((t) => t.symbol.endsWith ('USDT') && Number (t.count) > 0).sort ((a, b) => Number (b.count) - Number (a.count));
    const out = [];
    for (const w of wanted) {
        if (w === 'auto') {
            out.push (usdt[Math.floor (usdt.length * 0.8)].symbol);
        } else {
            out.push (w.toUpperCase ());
        }
    }
    const stats = Object.fromEntries (all.filter ((t) => out.includes (t.symbol)).map ((t) => [ t.symbol, { trades24h: Number (t.count), quoteVolume24h: Number (t.quoteVolume) } ]));
    return { symbols: out, stats, rank: Object.fromEntries (out.map ((s) => [ s, usdt.findIndex ((t) => t.symbol === s) + 1 ])), totalUsdt: usdt.length };
}

// stream suffix -> category
const STREAMS = {
    'trade': 'trades',                  // every trade
    'aggTrade': 'trades (aggregated)',
    'kline_1m': 'ohlcv (live kline pushes)',
    'ticker': 'ticker (24h rolling, 1s)',
    'bookTicker': 'top of book (every change)',
    'depth20@100ms': 'L2 top-20 snapshots (100ms)',
    'depth@100ms': 'L2 full diff deltas (100ms)',
};
if (MARKET === 'usdm') {
    STREAMS['markPrice@1s'] = 'mark price + funding (1s)';
}

function rowsOf (suffix, data) {
    if (suffix.startsWith ('depth@')) {
        return (data.b?.length ?? 0) + (data.a?.length ?? 0);    // changed price levels
    }
    if (suffix.startsWith ('depth20')) {
        return (data.bids?.length ?? data.b?.length ?? 0) + (data.asks?.length ?? data.a?.length ?? 0);
    }
    return 1;
}

async function record (symbols) {
    const lower = symbols.map ((s) => s.toLowerCase ());
    const names = lower.flatMap ((s) => Object.keys (STREAMS).map ((k) => `${s}@${k}`));
    const acc = {};
    for (const n of names) acc[n] = { msgs: 0, rows: 0, bytes: 0, chunks: [] };
    // group streams by endpoint URL, one connection per endpoint
    const byUrl = {};
    for (const n of names) {
        const url = wsUrlFor (n.slice (n.indexOf ('@') + 1));
        (byUrl[url] = byUrl[url] ?? []).push (n);
    }
    const sockets = Object.entries (byUrl).map (([ url, group ]) => new WebSocket (url + group.join ('/'), { agent }));
    let reconnects = 0;
    const onMessage = (buf) => {
        const localTs = Date.now ();
        const text = buf.toString ();
        const { stream, data } = JSON.parse (text);
        const a = acc[stream];
        if (!a) return;
        const suffix = stream.slice (stream.indexOf ('@') + 1);
        const line = `${localTs}\t${text}\n`;   // what a raw recorder would write: local ts + raw frame
        a.msgs += 1;
        a.rows += rowsOf (suffix, data);
        a.bytes += Buffer.byteLength (line);
        a.chunks.push (line);
    };
    for (const ws of sockets) {
        ws.on ('message', onMessage);
        ws.on ('close', () => { reconnects += 1; });
    }
    await Promise.all (sockets.map ((ws) => new Promise ((res, rej) => { ws.once ('open', res); ws.once ('error', rej); })));
    const t0 = Date.now ();
    process.stderr.write (`recording ${names.length} streams for ${MINUTES} min…\n`);
    const timer = setInterval (() => process.stderr.write (`  ${((Date.now () - t0) / 60000).toFixed (1)} min\n`), 60000);
    await new Promise ((res) => setTimeout (res, MINUTES * 60000));
    clearInterval (timer);
    const seconds = (Date.now () - t0) / 1000;
    const closedEarly = reconnects;
    for (const ws of sockets) ws.close ();
    return { acc, seconds, reconnects: closedEarly };
}

function compress (chunks) {
    const raw = Buffer.from (chunks.join (''));
    const gzip = zlib.gzipSync (raw, { level: 9 }).length;
    const brotli = zlib.brotliCompressSync (raw, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 9 } }).length;
    let zstd;
    if (zlib.zstdCompressSync) {
        zstd = zlib.zstdCompressSync (raw).length;
    }
    return { raw: raw.length, gzip, brotli, zstd };
}

// approximate size of the same data normalised into a columnar store (before compression)
const COLUMNAR_BYTES_PER_ROW = { trades: 33, 'trades (aggregated)': 41, 'top of book (every change)': 40, 'L2 full diff deltas (100ms)': 17, 'L2 top-20 snapshots (100ms)': 17, 'ohlcv (live kline pushes)': 48, 'ticker (24h rolling, 1s)': 100, 'mark price + funding (1s)': 40 };

const mb = (x) => (x / 1e6).toFixed (x < 1e6 ? 3 : 1);

const picked = await pickSymbols ();
// REST snapshots: a full-depth order book snapshot and 1000 1m candles
const snapshots = {};
for (const s of picked.symbols) {
    const depth = await get (`/depth?symbol=${s}&limit=${MARKET === 'usdm' ? 1000 : 5000}`);
    const klines = await get (`/klines?symbol=${s}&interval=1m&limit=1000`);
    snapshots[s] = {
        depthSnapshotBytes: depth.text.length,
        depthSnapshotGzip: zlib.gzipSync (depth.text).length,
        depthLevels: depth.json.bids.length + depth.json.asks.length,
        kline1mRowJsonBytes: klines.text.length / klines.json.length,
    };
}
const { acc, seconds, reconnects } = await record (picked.symbols);

const scaleDay = 86400 / seconds;
const report = { market: MARKET, minutes: seconds / 60, reconnects, symbols: {} };
for (const s of picked.symbols) {
    const lower = s.toLowerCase ();
    const st = picked.stats[s];
    const tradeStream = acc[`${lower}@trade`] ?? acc[`${lower}@aggTrade`];
    const observedPerDay = tradeStream.msgs * scaleDay;
    const rows = [];
    let rawDay = 0, gzDay = 0;
    for (const [ suffix, category ] of Object.entries (STREAMS)) {
        const a = acc[`${lower}@${suffix}`];
        const c = compress (a.chunks);
        const day = { raw: c.raw * scaleDay, gzip: c.gzip * scaleDay, brotli: c.brotli * scaleDay, zstd: c.zstd && c.zstd * scaleDay };
        const columnarDay = a.rows * scaleDay * (COLUMNAR_BYTES_PER_ROW[category] ?? 40);
        rawDay += day.raw; gzDay += day.gzip;
        rows.push ({ stream: suffix, category, msgs: a.msgs, rows: a.rows, windowRawMB: mb (c.raw), windowGzipMB: mb (c.gzip),
            perDay: { rawMB: mb (day.raw), gzipMB: mb (day.gzip), brotliMB: mb (day.brotli), zstdMB: day.zstd ? mb (day.zstd) : 'n/a', columnarUncompressedMB: mb (columnarDay) },
            perYearGzipGB: (day.gzip * 365 / 1e9).toFixed (1) });
    }
    report.symbols[s] = {
        rankByTrades: `${picked.rank[s]} of ${picked.totalUsdt} USDT pairs`,
        trades24h: st.trades24h, quoteVolume24hUSD: Math.round (st.quoteVolume24h),
        windowRepresentativeness: `observed trade rate × day = ${Math.round (observedPerDay)} vs 24h count ${st.trades24h} (${(observedPerDay / st.trades24h * 100).toFixed (0)}%)`,
        restSnapshots: snapshots[s],
        streams: rows,
        allStreamsPerDay: { rawMB: mb (rawDay), gzipMB: mb (gzDay) },
    };
}
// ---------------------------------------------------------------------------
// Whole-exchange extrapolation for this market type (spot or usdm).
// Each stream's daily compressed size is modelled as a power law of the symbol's 24h trade
// count, size = a * trades^k, fitted through the two measured symbols (one busy, one quiet).
// It is then summed over every symbol on the exchange using Binance's own 24h trade counts.
// OHLCV is exact arithmetic: 1440 one-minute rows per symbol per day.
if (picked.symbols.length >= 2) {
    const [ busy, quiet ] = picked.symbols;
    const all = await tradingTickers ();
    const counts = all.map ((t) => Number (t.count)).filter ((n) => n > 0);
    const totalTrades = counts.reduce ((x, y) => x + y, 0);
    const perStream = [];
    let totalDay = 0;
    for (const suffix of Object.keys (STREAMS)) {
        const b = report.symbols[busy].streams.find ((r) => r.stream === suffix);
        const q = report.symbols[quiet].streams.find ((r) => r.stream === suffix);
        const yb = Number (b.perDay.gzipMB), yq = Number (q.perDay.gzipMB);
        const tb = picked.stats[busy].trades24h, tq = picked.stats[quiet].trades24h;
        let k = (yb > 0 && yq > 0 && tb !== tq) ? Math.log (yb / yq) / Math.log (tb / tq) : 1;
        k = Math.min (Math.max (k, 0), 1.5);
        const a = yb / Math.pow (tb, k);
        const dayMB = counts.reduce ((sum, t) => sum + a * Math.pow (t, k), 0);
        totalDay += dayMB;
        // any extra symbols are a check on the fit: predicted vs measured
        const check = picked.symbols.slice (2).map ((x) => {
            const measured = Number (report.symbols[x].streams.find ((r) => r.stream === suffix).perDay.gzipMB);
            const predicted = a * Math.pow (picked.stats[x].trades24h, k);
            return `${x}: predicted ${predicted.toFixed (1)} MB/day, measured ${measured.toFixed (1)}`;
        });
        perStream.push ({ stream: suffix, category: STREAMS[suffix], fittedExponent: Number (k.toFixed (2)), exchangeGzipGBPerDay: (dayMB / 1e3).toFixed (1), exchangeGzipTBPerYear: (dayMB * 365 / 1e6).toFixed (2), check });
    }
    const ohlcvRaw = counts.length * 1440 * 365 * 50;
    report.wholeExchange = {
        market: MARKET, activeSymbols: counts.length, totalTrades24h: totalTrades,
        busySymbolShareOfTrades: `${(picked.stats[busy].trades24h / totalTrades * 100).toFixed (1)}%`,
        ohlcv1mPerYear: `${(ohlcvRaw / 1e9).toFixed (1)} GB raw (${counts.length} symbols × 525,600 rows × ~50 B)`,
        streams: perStream,
        note: 'Power-law fit through two symbols; rerun with more --symbols for a better fit. Streams overlap (trade vs aggTrade, depth20 vs depth diff): a store keeps one of each pair.',
    };
}
fs.writeFileSync ('binance-volume-report.json', JSON.stringify (report, null, 2));
console.log (JSON.stringify (report, null, 2));
