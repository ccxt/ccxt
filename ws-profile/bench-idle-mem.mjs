// Idle-connection memory: post-GC heap and RSS for N concurrent idle
// connections of one transport. Baseline is taken AFTER one warmup
// connection has been opened and closed (so lazily-initialized module state
// doesn't pollute the marginal per-connection cost).
// Usage: node --expose-gc bench-idle-mem.mjs --transport ws --url ws://127.0.0.1:9500 --conns 500 --batch 100
import { connectTransport } from './transports.mjs';
import { parseArgs, emit, postGcMem } from './common.mjs';

async function openAll (transport, url, n, batch) {
    const conns = [];
    while (conns.length < n) {
        const size = Math.min (batch, n - conns.length);
        const jobs = [];
        for (let i = 0; i < size; i++) {
            jobs.push (connectTransport (transport, url));
        }
        const batchConns = await Promise.all (jobs);
        for (const c of batchConns) {
            conns.push (c);
        }
        jobs.length = 0;
        await new Promise ((r) => setTimeout (r, 20));
    }
    return conns;
}

async function closeAll (conns, batch) {
    for (let i = 0; i < conns.length; i += batch) {
        await Promise.all (conns.slice (i, i + batch).map ((c) => c.close ().catch (() => {})));
    }
}

async function main () {
    const args = parseArgs (process.argv.slice (2));
    const transport = args.transport;
    const url = args.url || 'ws://127.0.0.1:9500';
    const n = Number (args.conns || 100);
    const batch = Number (args.batch || 100);
    // warmup: open + close one connection, then baseline
    const warm = await connectTransport (transport, url);
    await warm.close ();
    const base = await postGcMem ();
    const conns = await openAll (transport, url, n, batch);
    await new Promise ((r) => setTimeout (r, 500)); // let sockets settle
    const after = await postGcMem ();
    const mb = (bytes) => Math.round ((bytes / 1048576) * 100) / 100;
    const kb = (bytes) => Math.round ((bytes / 1024) * 10) / 10;
    emit ({
        bench: 'idlemem',
        transport,
        conns: n,
        base_heap_mb: mb (base.heapUsed),
        heap_mb: mb (after.heapUsed),
        rss_mb: mb (after.rss),
        per_conn_heap_kb: kb ((after.heapUsed - base.heapUsed) / n),
        per_conn_rss_kb: kb ((after.rss - base.rss) / n),
        external_mb: mb (after.external),
        array_buffers_mb: mb (after.arrayBuffers),
    });
    await closeAll (conns, batch);
}

main ().then (() => process.exit (0)).catch ((e) => { console.error (e); process.exit (1); });
