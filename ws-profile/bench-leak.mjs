// Leak check: post-GC heap growth after N and 2N echo messages on a single
// connection (linearity criterion). 100B text frames, pipelined.
// Usage: node --expose-gc bench-leak.mjs --transport ws --url ws://127.0.0.1:9500 --n 500000 --inflight 64
import { connectTransport } from './transports.mjs';
import { makePayload, parseArgs, emit, postGcMem } from './common.mjs';

function pipeRun (t, total, inflight, payload) {
    return new Promise ((resolve) => {
        let sent = 0;
        let received = 0;
        t.setOnMessage (() => {
            received++;
            if (sent < total) {
                t.send (payload);
                sent++;
            }
            if (received === total) {
                resolve ();
            }
        });
        const initial = Math.min (inflight, total);
        for (let i = 0; i < initial; i++) {
            t.send (payload);
            sent++;
        }
    });
}

async function main () {
    const args = parseArgs (process.argv.slice (2));
    const transport = args.transport;
    const url = args.url || 'ws://127.0.0.1:9500';
    const n = Number (args.n || 500000);
    const inflight = Number (args.inflight || 64);
    const { data } = makePayload ('text100');
    const t = await connectTransport (transport, url);
    await pipeRun (t, 20000, inflight, data); // warmup
    const h0 = await postGcMem ();
    await pipeRun (t, n, inflight, data);
    const h1 = await postGcMem ();
    await pipeRun (t, n, inflight, data);
    const h2 = await postGcMem ();
    const kb = (bytes) => Math.round (bytes / 1024);
    const growth1 = h1.heapUsed - h0.heapUsed;
    const growth2 = h2.heapUsed - h1.heapUsed;
    // leak criterion: second window grows again by a comparable, material amount
    const leak = (growth2 > 1024 * 1024) && (growth1 > 0) && (growth2 > growth1 * 0.5);
    emit ({
        bench: 'leak',
        transport,
        n,
        heap0_kb: kb (h0.heapUsed),
        heap_after_n_kb: kb (h1.heapUsed),
        heap_after_2n_kb: kb (h2.heapUsed),
        growth_first_n_kb: kb (growth1),
        growth_second_n_kb: kb (growth2),
        rss0_mb: Math.round (h0.rss / 1048576),
        rss_after_2n_mb: Math.round (h2.rss / 1048576),
        linear_growth_leak: leak,
    });
    await t.close ();
}

main ().then (() => process.exit (0)).catch ((e) => { console.error (e); process.exit (1); });
