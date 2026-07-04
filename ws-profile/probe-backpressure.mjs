// Backpressure probe: does the client transport buffer unread frames in
// process memory (no consumer backpressure), or does not-reading propagate to
// TCP so the SERVER stays blocked on bufferedAmount?
// Method: ask the blast server for 100k x 1KB deltas, then DON'T consume for
// 2s (stream: don't call reader.read(); event transports: can't opt out —
// events fire anyway). Measure client heap+arrayBuffers growth during the
// stall and how many messages had already been delivered.
// Usage: node --expose-gc probe-backpressure.mjs --url ws://127.0.0.1:9500
import { WebSocket as UndiciWebSocket, WebSocketStream as UndiciWebSocketStream } from 'undici';
import { parseArgs, postGcMem } from './common.mjs';

const COUNT = 100000;

async function probeStream (url) {
    const wsstream = new UndiciWebSocketStream (url);
    const { readable, writable } = await wsstream.opened;
    const writer = writable.getWriter ();
    const reader = readable.getReader ();
    const before = await postGcMem ();
    writer.write ('__blast__' + JSON.stringify ({ count: COUNT }));
    await new Promise ((r) => setTimeout (r, 2000)); // stall: no reads
    const during = await postGcMem ();
    // now drain
    let received = 0;
    for (;;) {
        const { done, value } = await reader.read ();
        if (done || value === '__done__') break;
        received++;
    }
    wsstream.close ({ closeCode: 1000 });
    return {
        transport: 'stream (not reading for 2s)',
        heap_growth_during_stall_mb: Math.round ((during.heapUsed - before.heapUsed) / 1048576 * 100) / 100,
        array_buffers_growth_mb: Math.round ((during.arrayBuffers - before.arrayBuffers) / 1048576 * 100) / 100,
        rss_growth_mb: Math.round ((during.rss - before.rss) / 1048576 * 100) / 100,
        drained_after: received,
    };
}

async function probeEvents (url) {
    const sock = new UndiciWebSocket (url);
    sock.binaryType = 'arraybuffer';
    await new Promise ((res) => { sock.onopen = res; });
    let received = 0;
    let doneResolve;
    const donePromise = new Promise ((r) => { doneResolve = r; });
    const stash = []; // simulate a consumer that queues instead of processing
    sock.onmessage = (e) => {
        if (e.data === '__done__') {
            doneResolve ();
            return;
        }
        received++;
        stash.push (e.data);
    };
    const before = await postGcMem ();
    sock.send ('__blast__' + JSON.stringify ({ count: COUNT }));
    await new Promise ((r) => setTimeout (r, 2000));
    const during = await postGcMem ();
    const deliveredDuringStall = received;
    await donePromise;
    sock.close ();
    const result = {
        transport: 'undici events (handler queues, app never processes)',
        delivered_during_2s: deliveredDuringStall,
        heap_growth_during_stall_mb: Math.round ((during.heapUsed - before.heapUsed) / 1048576 * 100) / 100,
        rss_growth_mb: Math.round ((during.rss - before.rss) / 1048576 * 100) / 100,
    };
    stash.length = 0;
    return result;
}

async function main () {
    const args = parseArgs (process.argv.slice (2));
    const url = args.url || 'ws://127.0.0.1:9500';
    const stream = await probeStream (url);
    const events = await probeEvents (url);
    console.log ('PROBE ' + JSON.stringify ({ stream, events }, null, 2));
}

main ().then (() => process.exit (0)).catch ((e) => { console.error (e); process.exit (1); });
