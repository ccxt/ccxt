// Echo throughput: round-trips/s, sequential and pipelined.
// Usage: node --expose-gc bench-echo.mjs --transport ws --url ws://127.0.0.1:9500
//        --payload json1k --mode pipe --count 50000 --inflight 128 --warmup 5000
import { connectTransport } from './transports.mjs';
import { makePayload, parseArgs, emit } from './common.mjs';

function seqRun (t, n, payload) {
    return new Promise ((resolve) => {
        let received = 0;
        t.setOnMessage (() => {
            received++;
            if (received === n) {
                resolve ();
            } else {
                t.send (payload);
            }
        });
        t.send (payload);
    });
}

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
    const payloadKind = args.payload || 'json1k';
    const mode = args.mode || 'pipe';
    const count = Number (args.count || 50000);
    const inflight = Number (args.inflight || 128);
    const warmup = Number (args.warmup || Math.min (5000, count));
    const { data } = makePayload (payloadKind);
    const t = await connectTransport (transport, url);
    // warmup
    if (mode === 'seq') {
        await seqRun (t, warmup, data);
    } else {
        await pipeRun (t, warmup, inflight, data);
    }
    // measured run
    const start = process.hrtime.bigint ();
    if (mode === 'seq') {
        await seqRun (t, count, data);
    } else {
        await pipeRun (t, count, inflight, data);
    }
    const elapsedMs = Number (process.hrtime.bigint () - start) / 1e6;
    emit ({
        bench: 'echo',
        transport,
        payload: payloadKind,
        mode,
        count,
        inflight: (mode === 'pipe') ? inflight : 1,
        elapsed_ms: Math.round (elapsedMs * 10) / 10,
        rps: Math.round (count / (elapsedMs / 1000)),
    });
    await t.close ();
}

main ().then (() => process.exit (0)).catch ((e) => { console.error (e); process.exit (1); });
