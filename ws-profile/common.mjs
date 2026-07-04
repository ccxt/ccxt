// Shared helpers for the ws-profile benchmark suite.
// METHODOLOGY: never measure heap from a module body (top-level-await frames
// pin loop locals in the generator register file — see
// `git show heap-probe-work:HEAP-PROBE-FINDINGS.md`). Every benchmark loop in
// this suite runs inside a helper async function invoked from main().

export const ECHO_PORT = 9600;
export const DEFLATE_PORT = 9601;
export const TLS_PORT = 9602;

// ---------------------------------------------------------------------------
// post-GC memory probe: 2x gc, 250ms settle, 1x gc (pinned methodology)
export async function postGcMem () {
    if (typeof globalThis.gc !== 'function') {
        throw new Error ('run with --expose-gc');
    }
    globalThis.gc ();
    globalThis.gc ();
    await new Promise ((r) => setTimeout (r, 250));
    globalThis.gc ();
    const m = process.memoryUsage ();
    return { heapUsed: m.heapUsed, rss: m.rss, external: m.external, arrayBuffers: m.arrayBuffers };
}

// ---------------------------------------------------------------------------
// stats
export function percentile (sorted, p) {
    if (sorted.length === 0) return NaN;
    const idx = Math.min (sorted.length - 1, Math.ceil ((p / 100) * sorted.length) - 1);
    return sorted[Math.max (0, idx)];
}

export function median (values) {
    const s = [ ...values ].sort ((a, b) => a - b);
    const mid = Math.floor (s.length / 2);
    return (s.length % 2) ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

// ---------------------------------------------------------------------------
// payloads (pinned)
export function makePayload (kind) {
    switch (kind) {
        case 'text100': {
            // non-JSON text so ccxt's Client.onMessage does not attempt JSON.parse
            return { type: 'text', data: 'x'.repeat (100) };
        }
        case 'json1k': {
            // deterministic ~1KB order-book delta, padded to exactly 1024 bytes
            const obj = { e: 'depthUpdate', E: 1581358737706, s: 'ETHBTC', U: 157, u: 160, b: [], a: [], pad: '' };
            let i = 0;
            while (JSON.stringify (obj).length < 960) {
                obj.b.push ([ (3000 + i * 0.01).toFixed (8), (1 + i % 9).toFixed (8) ]);
                i++;
            }
            const gap = 1024 - JSON.stringify (obj).length;
            obj.pad = 'p'.repeat (gap);
            return { type: 'text', data: JSON.stringify (obj) };
        }
        case 'json20k': {
            // deterministic ~20KB order-book snapshot, padded to exactly 20480 bytes
            const obj = { lastUpdateId: 160, bids: [], asks: [], pad: '' };
            let i = 0;
            while (JSON.stringify (obj).length < 20 * 1024 - 64) {
                obj.bids.push ([ (3000 + i * 0.01).toFixed (8), (1 + i % 9).toFixed (8) ]);
                obj.asks.push ([ (3001 + i * 0.01).toFixed (8), (1 + i % 7).toFixed (8) ]);
                i++;
            }
            const gap = 20480 - JSON.stringify (obj).length;
            obj.pad = 'p'.repeat (gap);
            return { type: 'text', data: JSON.stringify (obj) };
        }
        case 'bin1k': {
            const buf = Buffer.alloc (1024);
            for (let i = 0; i < buf.length; i++) buf[i] = (i * 31 + 7) & 0xff;
            return { type: 'binary', data: buf };
        }
        default:
            throw new Error ('unknown payload kind ' + kind);
    }
}

// 1KB order-book delta for broadcast (JSON text), with a rotating set of 64
// variants so consecutive messages differ.
export function makeDeltas () {
    const variants = [];
    for (let v = 0; v < 64; v++) {
        const obj = { e: 'depthUpdate', E: 1700000000000 + v, s: 'BTCUSDT', U: v * 100, u: v * 100 + 99, b: [], a: [] };
        let i = 0;
        while (JSON.stringify (obj).length < 990) {
            obj.b.push ([ (10000 + v + i * 0.01).toFixed (2), (1 + (v * i) % 7).toFixed (4) ]);
            obj.a.push ([ (10001 + v + i * 0.01).toFixed (2), (1 + (v + i) % 5).toFixed (4) ]);
            i++;
        }
        variants.push (JSON.stringify (obj));
    }
    return variants;
}

// ---------------------------------------------------------------------------
// broadcast payload variants for the TLS receive benchmark. Every message can
// carry a server-side send timestamp: full message = '{"t":' + µs + ',' + rest
// so the server can stamp cheaply with one string concat. Sizes are padded to
// the target with a t placeholder of 10 digits (µs monotonic ~ machine uptime).
//  - tick100:  ~100B trade tick (smallest realistic exchange message)
//  - delta1k:  ~1KB order-book delta (dominant ccxt workload shape)
//  - snap20k:  ~20KB order-book snapshot
export function makeBroadcastVariants (kind) {
    const targets = { 'tick100': 100, 'delta1k': 1024, 'snap20k': 20480 };
    const target = targets[kind];
    if (!target) throw new Error ('unknown broadcast kind ' + kind);
    const rests = [];
    const fulls = [];
    for (let v = 0; v < 64; v++) {
        let obj;
        if (kind === 'tick100') {
            obj = { e: 'trade', s: 'BTCUSDT', p: (10000 + v * 0.01).toFixed (2), q: (1 + v % 9).toFixed (4), m: (v % 2) === 0, pad: '' };
        } else if (kind === 'delta1k') {
            obj = { e: 'depthUpdate', E: 1700000000000 + v, s: 'BTCUSDT', U: v * 100, u: v * 100 + 99, b: [], a: [], pad: '' };
            let i = 0;
            while (JSON.stringify (obj).length < target - 80) {
                obj.b.push ([ (10000 + v + i * 0.01).toFixed (2), (1 + (v * i) % 7).toFixed (4) ]);
                obj.a.push ([ (10001 + v + i * 0.01).toFixed (2), (1 + (v + i) % 5).toFixed (4) ]);
                i++;
            }
        } else {
            obj = { e: 'depthSnapshot', lastUpdateId: 1000 + v, s: 'BTCUSDT', bids: [], asks: [], pad: '' };
            let i = 0;
            while (JSON.stringify (obj).length < target - 96) {
                obj.bids.push ([ (10000 + v + i * 0.01).toFixed (8), (1 + (v + i) % 9).toFixed (8) ]);
                obj.asks.push ([ (10001 + v + i * 0.01).toFixed (8), (1 + (v * i) % 7).toFixed (8) ]);
                i++;
            }
        }
        // pad so that '{"t":' + 10-digit-µs + ',' + rest hits the target size
        const stampLen = '{"t":'.length + 10 + ','.length;
        let s = JSON.stringify (obj);
        const gap = target - (s.length - 1) - stampLen;
        obj.pad = 'p'.repeat (Math.max (0, gap));
        s = JSON.stringify (obj);
        const rest = s.slice (1); // drop leading '{'
        rests.push (rest);
        fulls.push ('{"t":0,' + rest);
    }
    return { rests, fulls };
}

// ---------------------------------------------------------------------------
// tiny arg parser: --key value / --flag
export function parseArgs (argv) {
    const args = {};
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a.startsWith ('--')) {
            const key = a.slice (2);
            const next = argv[i + 1];
            if (next === undefined || next.startsWith ('--')) {
                args[key] = true;
            } else {
                args[key] = next;
                i++;
            }
        }
    }
    return args;
}

export function emit (result) {
    process.stdout.write ('RESULT ' + JSON.stringify (result) + '\n');
}
