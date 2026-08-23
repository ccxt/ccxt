// CCXT cross-language benchmark — JavaScript (Node.js)
//
// Measures, for a fixed workload against a real exchange:
//   - latency     (per-call wall time, REST; inter-update gap, WS)
//   - network vs. processing  (REST) — a per-call trace that splits the wall
//     time into time on the wire and time the library spends on the CPU, by
//     wrapping the base `fetch` and `parseJson` methods:
//         network    = time inside fetch()  −  time inside JSON decode
//         processing = total fetchOrderBook  −  network   (sign + decode + parse)
//   - CPU          (user + system CPU seconds via process.cpuUsage)
//   - memory       (peak resident set size, read from /proc/self/status VmHWM)
//   - bandwidth    (bytes of HTTP response body parsed, REST only)
//
// Usage:  node bench.mjs rest   |   node bench.mjs ws
// Config via env: BENCH_EXCHANGE, BENCH_SYMBOL, BENCH_REST_ITERS,
//                 BENCH_REST_WARMUP, BENCH_WS_UPDATES, BENCH_SLEEP_MS

import fs from 'fs';
import ccxt, { version } from '../../js/ccxt.js';

const EXCHANGE = process.env.BENCH_EXCHANGE || 'coinbase';
const SYMBOL = process.env.BENCH_SYMBOL || 'BTC/USD';
const REST_ITERS = parseInt (process.env.BENCH_REST_ITERS || '60');
const WARMUP = parseInt (process.env.BENCH_REST_WARMUP || '5');
const WS_UPDATES = parseInt (process.env.BENCH_WS_UPDATES || '200');
const SLEEP_MS = parseInt (process.env.BENCH_SLEEP_MS || '250');
const LOAD_SECONDS = parseInt (process.env.BENCH_LOAD_SECONDS || '8');
const LOAD_LEVELS = parseInt (process.env.BENCH_LOAD_LEVELS || '1000');
const LOAD_RETAIN = parseInt (process.env.BENCH_LOAD_RETAIN || '2000');

const now = () => Number (process.hrtime.bigint ()) / 1e6; // ms, sub-ms precision
const sleep = (ms) => new Promise ((r) => setTimeout (r, ms));

function statusKb (field) {
    try {
        const s = fs.readFileSync ('/proc/self/status', 'utf8');
        const m = s.match (new RegExp (field + ':\\s+(\\d+)\\s+kB'));
        return m ? parseInt (m[1]) : 0;
    } catch (e) {
        return 0;
    }
}
const peakRssKb = () => statusKb ('VmHWM');   // high-water mark
const currentRssKb = () => statusKb ('VmRSS'); // current resident

// deterministic synthetic order book (integer values → identical JSON bytes in every language)
function buildRawBook (levels) {
    const bids = [];
    const asks = [];
    for (let i = 0; i < levels; i++) {
        bids.push ([ 1000000 - i, 500 + i ]);
        asks.push ([ 1000000 + i, 500 + i ]);
    }
    return JSON.stringify ({ 'bids': bids, 'asks': asks, 'timestamp': 1700000000000 });
}

function stats (arr) {
    if (!arr.length) return { 'min': 0, 'p50': 0, 'p90': 0, 'p95': 0, 'p99': 0, 'max': 0, 'avg': 0 };
    const s = [ ...arr ].sort ((a, b) => a - b);
    const n = s.length;
    const sum = s.reduce ((a, b) => a + b, 0);
    const q = (p) => s[Math.min (n - 1, Math.floor (p * n))];
    return {
        'min': +s[0].toFixed (2),
        'p50': +q (0.5).toFixed (2),
        'p90': +q (0.9).toFixed (2),
        'p95': +q (0.95).toFixed (2),
        'p99': +q (0.99).toFixed (2),
        'max': +s[n - 1].toFixed (2),
        'avg': +(sum / n).toFixed (2),
    };
}

function emit (obj) {
    console.log ('##RESULT## ' + JSON.stringify (obj));
}

// subclass the exchange and instrument the two base methods every request goes
// through: fetch() (the whole HTTP layer) and parseJson() (JSON decode).
function tracedExchange (Base, config) {
    return new class extends Base {
        async fetch (url, method = 'GET', headers = undefined, body = undefined) {
            this.__jsonMs = 0;
            const t0 = now ();
            const r = await super.fetch (url, method, headers, body);
            this.__httpMs = now () - t0;
            return r;
        }
        parseJson (jsonString) {
            const t0 = now ();
            const r = super.parseJson (jsonString);
            this.__jsonMs += now () - t0;
            return r;
        }
    } (config);
}

async function benchRest () {
    const ex = tracedExchange (ccxt[EXCHANGE], { 'enableRateLimit': false });
    const w0 = now ();
    await ex.loadMarkets ();
    const loadMarketsMs = now () - w0;
    // warmup: prime the TCP/TLS connection and let tiered JITs settle before we measure
    for (let w = 0; w < WARMUP; w++) { await ex.fetchOrderBook (SYMBOL); }
    const cpu0 = process.cpuUsage ();
    const latency = [];
    const network = [];
    const processing = [];
    const jsonDecode = [];
    let bytes = 0;
    for (let i = 0; i < REST_ITERS; i++) {
        const t0 = now ();
        await ex.fetchOrderBook (SYMBOL);
        const total = now () - t0;
        const wire = ex.__httpMs - ex.__jsonMs;   // HTTP layer minus JSON decode
        latency.push (total);
        network.push (wire);
        processing.push (total - wire);
        jsonDecode.push (ex.__jsonMs);
        bytes += (ex.last_http_response || '').length;
        await sleep (SLEEP_MS);
    }
    const cpu = process.cpuUsage (cpu0);
    emit ({
        'language': 'JavaScript',
        'runtime': process.version,
        'ccxt': version,
        'mode': 'rest',
        'exchange': EXCHANGE,
        'symbol': SYMBOL,
        'iterations': REST_ITERS,
        'loadMarketsMs': +loadMarketsMs.toFixed (2),
        'latencyMs': stats (latency),
        'networkMs': stats (network),
        'processingMs': stats (processing),
        'jsonDecodeMs': stats (jsonDecode),
        'cpuUserSec': +(cpu.user / 1e6).toFixed (3),
        'cpuSystemSec': +(cpu.system / 1e6).toFixed (3),
        'peakRssMb': +(peakRssKb () / 1024).toFixed (1),
        'bytesTotal': bytes,
        'bytesPerCall': Math.round (bytes / REST_ITERS),
    });
    process.exit (0);
}

async function benchWs () {
    const ex = new ccxt.pro[EXCHANGE] ({});
    await ex.loadMarkets ();
    // the first update builds the full snapshot (a large one-time cost); measure it
    // separately and start the CPU/steady-state counters only AFTER it, so CPU-per-update
    // reflects the incremental delta cost, not the amortized snapshot build
    const s0 = now ();
    await ex.watchOrderBook (SYMBOL);
    const firstMs = now () - s0;
    const steady = WS_UPDATES - 1;
    const cpu0 = process.cpuUsage ();
    const t0 = now ();
    let last = t0;
    const gaps = [];
    for (let i = 0; i < steady; i++) {
        await ex.watchOrderBook (SYMBOL);
        const t = now ();
        gaps.push (t - last);
        last = t;
    }
    const steadyMs = now () - t0;
    const cpu = process.cpuUsage (cpu0);
    emit ({
        'language': 'JavaScript',
        'runtime': process.version,
        'ccxt': version,
        'mode': 'ws',
        'exchange': EXCHANGE,
        'symbol': SYMBOL,
        'updates': steady,
        'firstUpdateMs': +firstMs.toFixed (2),
        'gapMs': stats (gaps),
        'updatesPerSec': +(steady / (steadyMs / 1000)).toFixed (2),
        'cpuPerUpdateMs': +(cpu.user / 1e3 / steady).toFixed (3),
        'cpuUserSec': +(cpu.user / 1e6).toFixed (3),
        'cpuSystemSec': +(cpu.system / 1e6).toFixed (3),
        'peakRssMb': +(peakRssKb () / 1024).toFixed (1),
    });
    await ex.close ();
    process.exit (0);
}

// offline compute-bound load: parse a large order book in a tight loop (no network)
// to make CPU and memory differences measurable. Part A = CPU throughput; Part B =
// memory footprint of holding LOAD_RETAIN parsed books.
function benchLoad () {
    const ex = new ccxt[EXCHANGE] ({});
    const raw = buildRawBook (LOAD_LEVELS);
    for (let i = 0; i < 200; i++) { ex.parseOrderBook (ex.parseJson (raw), SYMBOL); } // warmup / JIT
    // Part A — CPU throughput, time-boxed
    const cpu0 = process.cpuUsage ();
    const t0 = now ();
    const deadline = t0 + LOAD_SECONDS * 1000;
    let ops = 0;
    let sink = 0;
    while (now () < deadline) {
        const ob = ex.parseOrderBook (ex.parseJson (raw), SYMBOL);
        sink += ob['bids'].length;
        ops++;
    }
    const wallA = now () - t0;
    const cpu = process.cpuUsage (cpu0);
    // Part B — memory footprint of retained structures
    const rssBefore = currentRssKb ();
    const kept = [];
    for (let i = 0; i < LOAD_RETAIN; i++) { kept.push (ex.parseOrderBook (ex.parseJson (raw), SYMBOL)); }
    const rssAfter = currentRssKb ();
    const perBookKb = +((rssAfter - rssBefore) / LOAD_RETAIN).toFixed (2);
    emit ({
        'language': 'JavaScript',
        'runtime': process.version,
        'ccxt': version,
        'mode': 'load',
        'levels': LOAD_LEVELS,
        'seconds': LOAD_SECONDS,
        'ops': ops,
        'opsPerSec': +(ops / (wallA / 1000)).toFixed (1),
        'cpuUserSec': +(cpu.user / 1e6).toFixed (3),
        'cpuSystemSec': +(cpu.system / 1e6).toFixed (3),
        'cpuPerOpUs': +((cpu.user + cpu.system) / ops).toFixed (2),
        'peakRssMb': +(peakRssKb () / 1024).toFixed (1),
        'retainBooks': LOAD_RETAIN,
        'perBookKb': perBookKb,
        'keptLen': kept.length + (sink > -1 ? 0 : 1),
    });
    process.exit (0);
}

const mode = process.argv[2] || 'rest';
if (mode === 'rest') {
    await benchRest ();
} else if (mode === 'ws') {
    await benchWs ();
} else {
    benchLoad ();
}
