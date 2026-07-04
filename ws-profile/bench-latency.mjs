// Round-trip latency percentiles on an otherwise idle connection.
// Usage: node --expose-gc bench-latency.mjs --transport ws --url ws://127.0.0.1:9500
//        --samples 5000 --warmup 1000 --payload text100
import { connectTransport } from './transports.mjs';
import { makePayload, parseArgs, emit, percentile } from './common.mjs';

function collect (t, n, payload, samples) {
    return new Promise ((resolve) => {
        let i = 0;
        let sentAt = 0n;
        t.setOnMessage (() => {
            const now = process.hrtime.bigint ();
            if (samples) {
                samples.push (Number (now - sentAt));
            }
            i++;
            if (i === n) {
                resolve ();
            } else {
                sentAt = process.hrtime.bigint ();
                t.send (payload);
            }
        });
        sentAt = process.hrtime.bigint ();
        t.send (payload);
    });
}

async function main () {
    const args = parseArgs (process.argv.slice (2));
    const transport = args.transport;
    const url = args.url || 'ws://127.0.0.1:9500';
    const payloadKind = args.payload || 'text100';
    const n = Number (args.samples || 5000);
    const warmup = Number (args.warmup || 1000);
    const { data } = makePayload (payloadKind);
    const t = await connectTransport (transport, url);
    await collect (t, warmup, data, null);
    const samples = [];
    await collect (t, n, data, samples);
    samples.sort ((a, b) => a - b);
    const us = (v) => Math.round (v / 100) / 10; // ns -> µs, 0.1µs resolution
    emit ({
        bench: 'latency',
        transport,
        payload: payloadKind,
        samples: n,
        p50_us: us (percentile (samples, 50)),
        p95_us: us (percentile (samples, 95)),
        p99_us: us (percentile (samples, 99)),
        min_us: us (samples[0]),
        max_us: us (samples[samples.length - 1]),
        mean_us: us (samples.reduce ((a, b) => a + b, 0) / samples.length),
    });
    await t.close ();
}

main ().then (() => process.exit (0)).catch ((e) => { console.error (e); process.exit (1); });
