// CCXT cross-language benchmark runner / orchestrator.
//
// Spawns the per-language benchmark (bench.mjs / bench.py / bench.php / Go),
// each REPS times, in both `rest` and `ws` modes, parses the ##RESULT## JSON
// line every child prints, aggregates (median across repetitions) and writes
// results.json + prints Markdown tables.
//
// Env overrides:
//   BENCH_PY   path to a python interpreter with ccxt deps (default: python3)
//   BENCH_GO   path to the compiled Go benchmark binary (default: go run)
//   BENCH_LANGS  comma list of langs to run (default: js,python,php,go)
//   BENCH_MODES  comma list of modes    (default: rest,ws)
//   REPS_REST / REPS_WS  repetitions per mode (default 3 / 2)
// plus every BENCH_* knob understood by the benchmark scripts.

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname (fileURLToPath (import.meta.url));
const PY = process.env.BENCH_PY || 'python3';
const GO = process.env.BENCH_GO || '';
const LANGS = (process.env.BENCH_LANGS || 'js,python,php,go').split (',');
const MODES = (process.env.BENCH_MODES || 'rest,ws,load').split (',');
const REPS_REST = parseInt (process.env.REPS_REST || '3');
const REPS_WS = parseInt (process.env.REPS_WS || '2');
const REPS_LOAD = parseInt (process.env.REPS_LOAD || '3');

function command (lang, mode) {
    if (lang === 'js') return [ 'node', [ path.join (__dirname, 'bench.mjs'), mode ] ];
    // 'pythonorjson' is the same script with BENCH_ORJSON=1 (see runOnce)
    if (lang === 'python' || lang === 'pythonorjson') return [ PY, [ path.join (__dirname, 'bench.py'), mode ] ];
    if (lang === 'php') return [ 'php', [ path.join (__dirname, 'bench.php'), mode ] ];
    if (lang === 'go') {
        if (GO) return [ GO, [ mode ] ];
        return [ 'go', [ 'run', '-C', path.join (__dirname, '..', '..', 'go'), './benchmark', mode ] ];
    }
    if (lang === 'csharp') {
        // C# only implements the offline `load` mode
        const dll = process.env.BENCH_CS || path.join (__dirname, '..', '..', 'cs', 'benchmark', 'bin', 'Release', 'net8.0', 'ccxtbench.dll');
        return [ 'dotnet', [ 'exec', dll, mode ] ];
    }
    if (lang === 'java') {
        // Java only implements the offline `load` mode; run through the gradle module
        const gradle = process.env.BENCH_GRADLE || 'gradle';
        return [ gradle, [ '-p', path.join (__dirname, '..', '..', 'java'), ':benchmark:run', '--args=' + mode, '--console=plain', '-q' ] ];
    }
    throw new Error ('unknown lang ' + lang);
}

function runOnce (lang, mode) {
    const [ cmd, args ] = command (lang, mode);
    const env = { ...process.env };
    if (lang === 'pythonorjson') env['BENCH_ORJSON'] = '1';
    return new Promise ((resolve, reject) => {
        const child = spawn (cmd, args, { 'env': env });
        let out = '';
        let err = '';
        child.stdout.on ('data', (d) => { out += d.toString (); });
        child.stderr.on ('data', (d) => { err += d.toString (); });
        child.on ('close', () => {
            const line = out.split ('\n').find ((l) => l.startsWith ('##RESULT##'));
            if (!line) {
                reject (new Error (`${lang}/${mode}: no result. stderr tail: ${err.slice (-400)}`));
                return;
            }
            resolve (JSON.parse (line.slice (10)));
        });
        child.on ('error', reject);
    });
}

function median (nums) {
    const s = [ ...nums ].sort ((a, b) => a - b);
    const n = s.length;
    return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

// aggregate an array of result objects -> one object with median of every numeric leaf
function aggregate (runs) {
    const base = runs[0];
    const out = {};
    for (const k of Object.keys (base)) {
        const v = base[k];
        if (typeof v === 'number') {
            out[k] = +median (runs.map ((r) => r[k])).toFixed (3);
        } else if (v && typeof v === 'object') {
            out[k] = {};
            for (const sk of Object.keys (v)) {
                out[k][sk] = +median (runs.map ((r) => r[k][sk])).toFixed (3);
            }
        } else {
            out[k] = v;
        }
    }
    out['reps'] = runs.length;
    return out;
}

async function main () {
    const results = {};
    for (const mode of MODES) {
        const reps = mode === 'ws' ? REPS_WS : (mode === 'load' ? REPS_LOAD : REPS_REST);
        for (const lang of LANGS) {
            const runs = [];
            for (let i = 0; i < reps; i++) {
                process.stderr.write (`running ${lang} ${mode} (${i + 1}/${reps})...\n`);
                try {
                    runs.push (await runOnce (lang, mode));
                } catch (e) {
                    process.stderr.write (`  FAILED: ${e.message}\n`);
                }
            }
            if (runs.length) {
                results[`${lang}:${mode}`] = aggregate (runs);
            }
        }
    }
    const outPath = path.join (__dirname, 'results.json');
    // merge into any existing results so a scoped run (e.g. BENCH_MODES=load) does
    // not clobber the other modes' numbers
    let existing = {};
    try {
        existing = JSON.parse (fs.readFileSync (outPath, 'utf8'));
    } catch (e) {
        existing = {};
    }
    fs.writeFileSync (outPath, JSON.stringify ({ ...existing, ...results }, null, 2));
    process.stderr.write (`\nwrote ${outPath}\n\n`);
    printTables (results);
}

function printTables (results) {
    const rest = MODES.includes ('rest');
    const ws = MODES.includes ('ws');
    const load = MODES.includes ('load');
    if (load) {
        console.log ('### Load — offline order-book parsing (compute-bound, median of reps)\n');
        console.log ('| Language | Throughput (ops/s) | CPU per op (µs) | Peak RSS (MB) | Memory per book (KB) |');
        console.log ('|---|---|---|---|---|');
        for (const lang of LANGS) {
            const r = results[`${lang}:load`];
            if (!r) continue;
            console.log (`| ${r.language} | ${r.opsPerSec} | ${r.cpuPerOpUs} | ${r.peakRssMb} | ${r.perBookKb} |`);
        }
        console.log ('');
    }
    if (rest) {
        console.log ('### REST — fetchOrderBook (median of reps), latency split into network vs. processing\n');
        console.log ('| Language | Latency p50 | Latency p95 | Network p50 | Processing p50 | Processing p95 | CPU/call | Peak RSS |');
        console.log ('|---|---|---|---|---|---|---|---|');
        for (const lang of LANGS) {
            const r = results[`${lang}:rest`];
            if (!r) continue;
            const cpuPerCall = (r.cpuUserSec / r.iterations * 1000).toFixed (1);
            console.log (`| ${r.language} | ${r.latencyMs.p50} ms | ${r.latencyMs.p95} ms | ${r.networkMs.p50} ms | ${r.processingMs.p50} ms | ${r.processingMs.p95} ms | ${cpuPerCall} ms | ${r.peakRssMb} MB |`);
        }
        console.log ('');
    }
    if (ws) {
        console.log ('### WebSocket — watchOrderBook (median of reps)\n');
        console.log ('| Language | Snapshot (ms) | Steady gap p50 | Updates/s | CPU/update | Peak RSS |');
        console.log ('|---|---|---|---|---|---|');
        for (const lang of LANGS) {
            const r = results[`${lang}:ws`];
            if (!r) continue;
            const cpuPerUpd = (r.cpuPerUpdateMs ?? (r.cpuUserSec / r.updates * 1000)).toFixed (2);
            console.log (`| ${r.language} | ${r.firstUpdateMs} | ${r.gapMs.p50} ms | ${r.updatesPerSec} | ${cpuPerUpd} ms | ${r.peakRssMb} MB |`);
        }
        console.log ('');
    }
}

await main ();
