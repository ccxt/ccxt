// TLS receive benchmark — the realistic ccxt pro workload: the client mostly
// RECEIVES exchange pushes over wss://. Server (separate process) pushes
// `count` JSON messages; the client runs the FULL ccxt Client path (WsClient
// over `ws`, or WsClientStreamFast over undici WebSocketStream), which parses
// every JSON message internally before the app callback.
//
// Modes:
//   --mode ceiling            uncapped push: receive-rate ceiling, CPU µs/msg,
//                             GC churn, event-loop lag, post-GC heap delta
//   --mode paced --rate R     R msgs/s (below ceiling) with server-side µs
//                             stamps: one-way delivery latency percentiles
//                             (CLOCK_MONOTONIC is shared across processes on
//                             one host, so cross-process deltas are valid)
//   --mode leak               two consecutive pushes of `count` with post-GC
//                             heap checkpoints (N vs 2N linearity criterion)
//
// Usage: node --expose-gc bench-recv.mjs --transport ccxt --url wss://127.0.0.1:9502
//        --kind delta1k --count 200000 --mode ceiling
import { monitorEventLoopDelay, PerformanceObserver } from 'perf_hooks';
import { connectTransport } from './transports.mjs';
import { parseArgs, emit, postGcMem, percentile } from './common.mjs';

function receiveAll (t, cmd, latencies) {
    return new Promise ((resolve) => {
        let received = 0;
        let firstAt = 0n;
        let lastAt = 0n;
        t.setOnMessage ((msg) => {
            if (typeof msg === 'string') {
                if (msg === '__done__') {
                    resolve ({ received, firstAt, lastAt });
                }
                return;
            }
            // both clients deliver parsed objects (ccxt Client parses JSON internally)
            const now = process.hrtime.bigint ();
            if (received === 0) {
                firstAt = now;
            }
            received++;
            lastAt = now;
            if (latencies) {
                latencies.push (Number (now / 1000n) - Number (msg.t));
            }
        });
        t.send ('__blast__' + JSON.stringify (cmd));
    });
}

async function main () {
    const args = parseArgs (process.argv.slice (2));
    const transport = args.transport;
    const url = args.url || 'wss://127.0.0.1:9502';
    const kind = args.kind || 'delta1k';
    const count = Number (args.count || 200000);
    const mode = args.mode || 'ceiling';
    const rate = Number (args.rate || 0);
    const t = await connectTransport (transport, url);
    // warmup push (JIT + TLS session + buffers)
    await receiveAll (t, { count: 20000, kind: 'delta1k' }, null);
    if (mode === 'leak') {
        const h0 = await postGcMem ();
        await receiveAll (t, { count, kind }, null);
        const h1 = await postGcMem ();
        await receiveAll (t, { count, kind }, null);
        const h2 = await postGcMem ();
        const kb = (b) => Math.round (b / 1024);
        const growth1 = h1.heapUsed - h0.heapUsed;
        const growth2 = h2.heapUsed - h1.heapUsed;
        emit ({
            bench: 'recv-leak', transport, kind, n: count,
            heap0_kb: kb (h0.heapUsed), heap_after_n_kb: kb (h1.heapUsed), heap_after_2n_kb: kb (h2.heapUsed),
            growth_first_n_kb: kb (growth1), growth_second_n_kb: kb (growth2),
            rss0_mb: Math.round (h0.rss / 1048576), rss_after_2n_mb: Math.round (h2.rss / 1048576),
            linear_growth_leak: (growth2 > 1024 * 1024) && (growth1 > 0) && (growth2 > growth1 * 0.5),
        });
        await t.close ();
        return;
    }
    // instrument
    const heapBefore = await postGcMem ();
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
    const latencies = (mode === 'paced') ? [] : null;
    const cpuBefore = process.cpuUsage ();
    const cmd = { count, kind };
    if (mode === 'paced') {
        cmd.stamp = true;
        cmd.rate = rate;
    }
    const { received, firstAt, lastAt } = await receiveAll (t, cmd, latencies);
    const cpu = process.cpuUsage (cpuBefore);
    eld.disable ();
    await new Promise ((r) => setTimeout (r, 50));
    obs.disconnect ();
    const heapAfter = await postGcMem ();
    const elapsedMs = Number (lastAt - firstAt) / 1e6;
    const lag = (ns) => Math.max (0, Math.round (ns / 1e4) / 100 - 10); // minus sampling resolution
    const result = {
        bench: 'recv',
        transport,
        kind,
        mode,
        count,
        received,
        elapsed_ms: Math.round (elapsedMs),
        recv_per_s: Math.round (received / (elapsedMs / 1000)),
        cpu_us_per_msg: Math.round (((cpu.user + cpu.system) / received) * 100) / 100,
        cpu_user_ms: Math.round (cpu.user / 1000),
        cpu_system_ms: Math.round (cpu.system / 1000),
        el_lag_mean_ms: lag (eld.mean),
        el_lag_p99_ms: lag (eld.percentile (99)),
        el_lag_max_ms: lag (eld.max),
        gc_count: gcCount,
        gc_time_ms: Math.round (gcTimeMs * 10) / 10,
        gc_ms_per_10k_msgs: Math.round ((gcTimeMs / (received / 10000)) * 100) / 100,
        heap_delta_post_gc_kb: Math.round ((heapAfter.heapUsed - heapBefore.heapUsed) / 1024),
    };
    if (latencies) {
        latencies.sort ((a, b) => a - b);
        result.rate_target = rate;
        result.delivery_p50_us = percentile (latencies, 50);
        result.delivery_p95_us = percentile (latencies, 95);
        result.delivery_p99_us = percentile (latencies, 99);
        result.delivery_max_us = latencies[latencies.length - 1];
    }
    emit (result);
    await t.close ();
}

main ().then (() => process.exit (0)).catch ((e) => { console.error (e); process.exit (1); });
