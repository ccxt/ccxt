// Broadcast / subscription pattern: server pushes `count` 1KB order-book
// deltas as fast as the socket drains; client measures receive-rate ceiling,
// event-loop lag and GC churn (count/time) during the receive window.
// Raw transports JSON.parse each delta (exchange-like handling); ccxt's
// WsClient already parses internally, so its handler receives objects.
// Usage: node --expose-gc bench-broadcast.mjs --transport ws --url ws://127.0.0.1:9500 --count 200000
import { monitorEventLoopDelay, PerformanceObserver } from 'perf_hooks';
import { connectTransport } from './transports.mjs';
import { parseArgs, emit } from './common.mjs';

function receiveAll (t, count) {
    return new Promise ((resolve) => {
        let received = 0;
        let firstAt = 0n;
        let lastAt = 0n;
        t.setOnMessage ((msg) => {
            if (typeof msg === 'string') {
                if (msg === '__done__') {
                    resolve ({ received, firstAt, lastAt });
                    return;
                }
                JSON.parse (msg); // exchange-like handling of the delta
            }
            // objects (ccxt pre-parsed) fall through: parse already happened inside WsClient
            if (received === 0) {
                firstAt = process.hrtime.bigint ();
            }
            received++;
            lastAt = process.hrtime.bigint ();
        });
        t.send ('__blast__' + JSON.stringify ({ count }));
    });
}

async function main () {
    const args = parseArgs (process.argv.slice (2));
    const transport = args.transport;
    const url = args.url || 'ws://127.0.0.1:9500';
    const count = Number (args.count || 200000);
    const t = await connectTransport (transport, url);
    // warmup blast
    await receiveAll (t, 20000);
    // instrument
    const eld = monitorEventLoopDelay ({ resolution: 10 });
    let gcCount = 0;
    let gcTimeMs = 0;
    const obs = new PerformanceObserver ((list) => {
        for (const entry of list.getEntries ()) {
            gcCount++;
            gcTimeMs += entry.duration;
        }
    });
    obs.observe ({ entryTypes: [ 'gc' ] });
    eld.enable ();
    const { received, firstAt, lastAt } = await receiveAll (t, count);
    eld.disable ();
    await new Promise ((r) => setTimeout (r, 50)); // let trailing gc entries flush
    obs.disconnect ();
    const elapsedMs = Number (lastAt - firstAt) / 1e6;
    // monitorEventLoopDelay values include the sampling resolution itself
    // (idle loop reports ~= resolution); subtract it to report actual lag
    const lag = (ns) => Math.max (0, Math.round (ns / 1e4) / 100 - 10);
    emit ({
        bench: 'broadcast',
        transport,
        count,
        received,
        elapsed_ms: Math.round (elapsedMs),
        recv_per_s: Math.round (received / (elapsedMs / 1000)),
        el_lag_mean_ms: lag (eld.mean),
        el_lag_p99_ms: lag (eld.percentile (99)),
        el_lag_max_ms: lag (eld.max),
        gc_count: gcCount,
        gc_time_ms: Math.round (gcTimeMs * 10) / 10,
        gc_ms_per_10k_msgs: Math.round ((gcTimeMs / (received / 10000)) * 100) / 100,
    });
    await t.close ();
}

main ().then (() => process.exit (0)).catch ((e) => { console.error (e); process.exit (1); });
