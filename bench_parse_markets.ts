// TS equivalent of the Rust bench_parse_markets bin. Reads the captured
// binance spot exchangeInfo and times parseMarkets() over its symbols.
//
//   npx tsx bench_parse_markets.ts [path] [iters]

import ccxt from './ts/ccxt.js';
import { performance } from 'perf_hooks';
import { readFileSync } from 'fs';

function main () {
    const path = process.argv[2] ?? '/tmp/binance_spot.json';
    const iters = parseInt (process.argv[3] ?? '20', 10);

    const text = readFileSync (path, 'utf8');
    console.error (`read ${text.length} bytes from ${path}`);

    // text → object (one-shot)
    const json_t0 = performance.now ();
    const parsed = JSON.parse (text);
    const json_ms = performance.now () - json_t0;

    const symbols = parsed.symbols;
    console.error (`JSON.parse: ${json_ms.toFixed (2)} ms — symbols: ${symbols.length}`);

    const ex: any = new (ccxt as any).binance ();
    // fetchMarkets normally seeds these before calling parseMarkets — initialise
    // them so parseMarket's `inArray` checks don't trip on undefined.
    ex.options['crossMarginPairsData'] = [];
    ex.options['isolatedMarginPairsData'] = [];

    // Warmup
    for (let i = 0; i < 3; i++) ex.parseMarkets (symbols);

    const samples: number[] = [];
    for (let i = 0; i < iters; i++) {
        const t0 = performance.now ();
        ex.parseMarkets (symbols);
        samples.push (performance.now () - t0);
    }
    samples.sort ((a, b) => a - b);
    const min = samples[0];
    const median = samples[Math.floor (iters / 2)];
    const max = samples[iters - 1];
    const avg = samples.reduce ((a, b) => a + b, 0) / iters;
    console.log (`parseMarkets (${symbols.length} symbols × ${iters} iters):`);
    console.log (`  min=${min.toFixed (2)} ms  median=${median.toFixed (2)} ms  avg=${avg.toFixed (2)} ms  max=${max.toFixed (2)} ms`);
    console.log (`  (one-shot JSON.parse: ${json_ms.toFixed (2)} ms)`);
}

main ();
