// Orchestrator: spawns the loopback server and each benchmark client as
// SEPARATE processes (clean GC/CPU accounting), repeats every measurement
// REPS times, stores raw + median results under ws-profile/results/.
// Usage: node run-all.mjs --phase throughput|latency|broadcast|idlemem|leak|tls|wsclient|wsclient-tls|wsclient-opt|wsclient-opt-tls|all
import { spawn } from 'child_process';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { parseArgs, median, ECHO_PORT, TLS_PORT } from './common.mjs';

const DIR = dirname (fileURLToPath (import.meta.url));
const RESULTS_DIR = join (DIR, 'results');
const REPS = 3;
const TRANSPORTS = [ 'ws', 'ws-async', 'ccxt', 'undici', 'global', 'stream' ];
const CORE_TRANSPORTS = [ 'ws', 'ccxt', 'undici', 'global', 'stream' ];

function run (script, args, { env = {}, timeout = 180000 } = {}) {
    return new Promise ((resolve, reject) => {
        const child = spawn (process.execPath, [ '--expose-gc', join (DIR, script), ...args ], {
            cwd: DIR,
            env: { ...process.env, ...env },
            stdio: [ 'ignore', 'pipe', 'pipe' ],
        });
        let out = '';
        let err = '';
        const timer = setTimeout (() => { child.kill ('SIGKILL'); reject (new Error ('timeout: ' + script + ' ' + args.join (' '))); }, timeout);
        child.stdout.on ('data', (d) => { out += d; });
        child.stderr.on ('data', (d) => { err += d; });
        child.on ('exit', (code) => {
            clearTimeout (timer);
            if (code !== 0) {
                reject (new Error (script + ' ' + args.join (' ') + ' exited ' + code + '\n' + err.slice (-2000)));
                return;
            }
            const line = out.split ('\n').find ((l) => l.startsWith ('RESULT '));
            if (!line) {
                reject (new Error ('no RESULT line from ' + script + ' ' + args.join (' ')));
                return;
            }
            resolve (JSON.parse (line.slice ('RESULT '.length)));
        });
    });
}

function startServer (args) {
    return new Promise ((resolve, reject) => {
        const child = spawn (process.execPath, [ join (DIR, 'server.mjs'), ...args ], { cwd: DIR, stdio: [ 'ignore', 'pipe', 'pipe' ] });
        child.stdout.on ('data', (d) => {
            if (d.toString ().includes ('LISTENING')) resolve (child);
        });
        child.on ('exit', (code) => reject (new Error ('server exited early: ' + code)));
    });
}

function save (name, raw, medians) {
    mkdirSync (RESULTS_DIR, { recursive: true });
    writeFileSync (join (RESULTS_DIR, name + '.raw.json'), JSON.stringify (raw, null, 2));
    writeFileSync (join (RESULTS_DIR, name + '.median.json'), JSON.stringify (medians, null, 2));
    console.log ('saved results/' + name + '.median.json');
}

// median over reps for every numeric field
function medianRow (rows) {
    const out = { ...rows[0] };
    for (const key of Object.keys (out)) {
        if (typeof out[key] === 'number') {
            out[key] = median (rows.map ((r) => r[key]));
        }
    }
    out.reps = rows.length;
    return out;
}

async function repeated (script, args, opts) {
    const rows = [];
    for (let i = 0; i < REPS; i++) {
        rows.push (await run (script, args, opts));
    }
    return rows;
}

async function phaseThroughput (url, resultName, env, payloads = [ 'text100', 'json1k', 'json20k', 'bin1k' ], transports = TRANSPORTS) {
    const raw = [];
    const medians = [];
    const scenarios = [];
    for (const payload of payloads) {
        for (const mode of [ 'seq', 'pipe' ]) {
            const count = (payload === 'json20k') ? ((mode === 'seq') ? 3000 : 15000) : ((mode === 'seq') ? 8000 : 60000);
            const warmup = (mode === 'seq') ? 1000 : 5000;
            scenarios.push ({ payload, mode, count, warmup });
        }
    }
    for (const transport of transports) {
        for (const s of scenarios) {
            const args = [ '--transport', transport, '--url', url, '--payload', s.payload, '--mode', s.mode,
                '--count', String (s.count), '--inflight', '128', '--warmup', String (s.warmup) ];
            try {
                const rows = await repeated ('bench-echo.mjs', args, { env });
                raw.push (...rows);
                const m = medianRow (rows);
                medians.push (m);
                console.log (`echo ${transport} ${s.payload} ${s.mode}: ${m.rps} rt/s (n=${s.count})`);
            } catch (e) {
                console.log (`echo ${transport} ${s.payload} ${s.mode}: FAILED — ${e.message.split ('\n')[0]}`);
                medians.push ({ bench: 'echo', transport, payload: s.payload, mode: s.mode, error: e.message.slice (0, 300) });
            }
        }
    }
    save (resultName, raw, medians);
}

async function phaseLatency (url, transports = CORE_TRANSPORTS, name = 'latency') {
    const raw = [];
    const medians = [];
    for (const transport of transports) {
        const args = [ '--transport', transport, '--url', url, '--samples', '5000', '--warmup', '1000', '--payload', 'text100' ];
        const rows = await repeated ('bench-latency.mjs', args, {});
        raw.push (...rows);
        const m = medianRow (rows);
        medians.push (m);
        console.log (`latency ${transport}: p50=${m.p50_us}µs p95=${m.p95_us}µs p99=${m.p99_us}µs`);
    }
    save (name, raw, medians);
}

async function phaseBroadcast (url, transports = CORE_TRANSPORTS, name = 'broadcast') {
    const raw = [];
    const medians = [];
    for (const transport of transports) {
        const args = [ '--transport', transport, '--url', url, '--count', '200000' ];
        const rows = await repeated ('bench-broadcast.mjs', args, { timeout: 300000 });
        raw.push (...rows);
        const m = medianRow (rows);
        medians.push (m);
        console.log (`broadcast ${transport}: ${m.recv_per_s} msg/s, lag p99 ${m.el_lag_p99_ms}ms, gc ${m.gc_count}x ${m.gc_time_ms}ms`);
    }
    save (name, raw, medians);
}

async function phaseIdleMem (url, transports = CORE_TRANSPORTS, name = 'idlemem') {
    const raw = [];
    const medians = [];
    for (const transport of transports) {
        for (const conns of [ 100, 500, 2000 ]) {
            const args = [ '--transport', transport, '--url', url, '--conns', String (conns), '--batch', '100' ];
            try {
                const rows = await repeated ('bench-idle-mem.mjs', args, { timeout: 300000 });
                raw.push (...rows);
                const m = medianRow (rows);
                medians.push (m);
                console.log (`idlemem ${transport} ${conns}: ${m.per_conn_heap_kb}KB heap/conn, rss ${m.rss_mb}MB`);
            } catch (e) {
                console.log (`idlemem ${transport} ${conns}: FAILED — ${e.message.split ('\n')[0]}`);
                medians.push ({ bench: 'idlemem', transport, conns, error: e.message.slice (0, 300) });
            }
        }
    }
    save (name, raw, medians);
}

async function phaseLeak (url, transports = CORE_TRANSPORTS, name = 'leak') {
    const raw = [];
    const medians = [];
    for (const transport of transports) {
        const args = [ '--transport', transport, '--url', url, '--n', '500000', '--inflight', '64' ];
        const rows = await repeated ('bench-leak.mjs', args, { timeout: 600000 });
        raw.push (...rows);
        const m = medianRow (rows);
        m.linear_growth_leak = rows.every ((r) => r.linear_growth_leak);
        medians.push (m);
        console.log (`leak ${transport}: +${m.growth_first_n_kb}KB after N, +${m.growth_second_n_kb}KB after 2N — leak=${m.linear_growth_leak}`);
    }
    save (name, raw, medians);
}

// TLS receive phase — the realistic ccxt workload (see bench-recv.mjs):
// production WsClient (ws, allowSynchronousEvents:false) vs WsClientStreamFast
const TLS_ENV = { NODE_TLS_REJECT_UNAUTHORIZED: '0' };
const RECV_PAIR = [ 'ccxt', 'ccxt-stream-fast' ];

async function phaseTlsRecv (url) {
    const raw = [];
    const medians = [];
    const runOne = async (label, args, timeout) => {
        const rows = await repeated ('bench-recv.mjs', args, { env: TLS_ENV, timeout });
        raw.push (...rows);
        const m = medianRow (rows);
        medians.push (m);
        console.log (label + ': ' + JSON.stringify (m));
    };
    // 1. receive-rate ceiling per payload kind
    const ceilings = [ [ 'tick100', 400000 ], [ 'delta1k', 200000 ], [ 'snap20k', 20000 ] ];
    for (const transport of RECV_PAIR) {
        for (const [ kind, count ] of ceilings) {
            await runOne (`recv-ceiling ${transport} ${kind}`, [ '--transport', transport, '--url', url,
                '--kind', kind, '--count', String (count), '--mode', 'ceiling' ], 300000);
        }
    }
    // 2. paced delivery latency (rates chosen below both ceilings)
    for (const transport of RECV_PAIR) {
        for (const rate of [ 20000, 60000 ]) {
            await runOne (`recv-paced ${transport} delta1k@${rate}/s`, [ '--transport', transport, '--url', url,
                '--kind', 'delta1k', '--count', '240000', '--mode', 'paced', '--rate', String (rate) ], 600000);
        }
    }
    // 3. sustained receive leak check (N vs 2N)
    for (const transport of RECV_PAIR) {
        await runOne (`recv-leak ${transport}`, [ '--transport', transport, '--url', url,
            '--kind', 'delta1k', '--count', '500000', '--mode', 'leak' ], 600000);
    }
    save ('tls-recv', raw, medians);
}

async function main () {
    const args = parseArgs (process.argv.slice (2));
    const phase = args.phase || 'all';
    let server = null;
    try {
        if (phase === 'tls-recv') {
            server = await startServer ([ '--port', String (TLS_PORT), '--tls' ]);
            await phaseTlsRecv ('wss://127.0.0.1:' + TLS_PORT);
        } else if (phase === 'tls') {
            server = await startServer ([ '--port', String (TLS_PORT), '--tls' ]);
            const url = 'wss://127.0.0.1:' + TLS_PORT;
            // reduced matrix: json1k + json20k over the five core transports
            await phaseThroughput (url, 'throughput-tls', { NODE_TLS_REJECT_UNAUTHORIZED: '0' }, [ 'json1k', 'json20k' ], CORE_TRANSPORTS);
        } else if (phase === 'wsclient-tls') {
            // head-to-head: production WsClient (ws) vs WebSocketStream refactor, TLS
            server = await startServer ([ '--port', String (TLS_PORT), '--tls' ]);
            const url = 'wss://127.0.0.1:' + TLS_PORT;
            await phaseThroughput (url, 'wsclient-throughput-tls', { NODE_TLS_REJECT_UNAUTHORIZED: '0' }, [ 'json1k', 'json20k' ], [ 'ccxt', 'ccxt-stream' ]);
        } else if (phase === 'wsclient-opt') {
            // three-way: production vs faithful stream refactor vs optimized
            server = await startServer ([ '--port', String (ECHO_PORT) ]);
            const url = 'ws://127.0.0.1:' + ECHO_PORT;
            const trio = [ 'ccxt', 'ccxt-stream', 'ccxt-stream-fast' ];
            await phaseThroughput (url, 'wsclient-opt-throughput', {}, [ 'text100', 'json1k', 'json20k', 'bin1k' ], trio);
            await phaseLatency (url, trio, 'wsclient-opt-latency');
            await phaseBroadcast (url, trio, 'wsclient-opt-broadcast');
            await phaseIdleMem (url, [ 'ccxt-stream-fast' ], 'wsclient-opt-idlemem');
            await phaseLeak (url, [ 'ccxt-stream-fast' ], 'wsclient-opt-leak');
        } else if (phase === 'wsclient-opt-tls') {
            server = await startServer ([ '--port', String (TLS_PORT), '--tls' ]);
            const url = 'wss://127.0.0.1:' + TLS_PORT;
            await phaseThroughput (url, 'wsclient-opt-throughput-tls', { NODE_TLS_REJECT_UNAUTHORIZED: '0' }, [ 'json1k', 'json20k' ], [ 'ccxt', 'ccxt-stream-fast' ]);
        } else if (phase === 'wsclient') {
            // head-to-head: production WsClient (ws) vs WebSocketStream refactor
            server = await startServer ([ '--port', String (ECHO_PORT) ]);
            const url = 'ws://127.0.0.1:' + ECHO_PORT;
            const pair = [ 'ccxt', 'ccxt-stream' ];
            await phaseThroughput (url, 'wsclient-throughput', {}, [ 'text100', 'json1k', 'json20k', 'bin1k' ], pair);
            await phaseLatency (url, pair, 'wsclient-latency');
            await phaseBroadcast (url, pair, 'wsclient-broadcast');
            await phaseIdleMem (url, pair, 'wsclient-idlemem');
            await phaseLeak (url, pair, 'wsclient-leak');
        } else {
            server = await startServer ([ '--port', String (ECHO_PORT) ]);
            const url = 'ws://127.0.0.1:' + ECHO_PORT;
            if (phase === 'throughput' || phase === 'all') await phaseThroughput (url, 'throughput', {});
            if (phase === 'latency' || phase === 'all') await phaseLatency (url);
            if (phase === 'broadcast' || phase === 'all') await phaseBroadcast (url);
            if (phase === 'idlemem' || phase === 'all') await phaseIdleMem (url);
            if (phase === 'leak' || phase === 'all') await phaseLeak (url);
        }
    } finally {
        if (server) server.kill ('SIGKILL');
    }
}

main ().then (() => process.exit (0)).catch ((e) => { console.error (e); process.exit (1); });
