// probe-duplex-modes — raw `ws` events vs createWebSocketStream consumption
// modes: throughput, message-boundary integrity (JSON framing), and whether
// receive backpressure (ws.pause) actually engages. Evidence for basing
// WsClientStreamFast on { readableObjectMode: true }.
// Usage: node probe-duplex-modes.mjs   (server forks itself, port 0)
import { fork } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import WsPackage, { WebSocketServer, createWebSocketStream } from 'ws';

const __filename = fileURLToPath (import.meta.url);
const require = createRequire (import.meta.url);

const N = 200_000;
const PAYLOAD = JSON.stringify ({ ch: 'trades', pad: 'a'.repeat (200) }); // constant-size exchange-style tick
const PAYLOAD_BYTES = Buffer.byteLength (PAYLOAD);

if (process.argv[2] === 'server') {
    const wss = new WebSocketServer ({ port: 0, perMessageDeflate: false });
    wss.on ('listening', () => process.send (wss.address ().port));
    wss.on ('connection', (ws) => {
        let sent = 0;
        const pump = () => {
            while (sent < N) {
                ws.send (PAYLOAD);
                sent++;
                if (ws.bufferedAmount > 4 * 1024 * 1024) {
                    return void setTimeout (pump, 2);
                }
            }
        };
        pump ();
    });
} else {
    const server = fork (__filename, [ 'server' ]);
    server.once ('message', async (port) => {
        const url = `ws://127.0.0.1:${port}`;
        console.log (`# node ${process.version}, ws ${require ('ws/package.json').version}, ${N} x ${PAYLOAD_BYTES}B JSON messages, loopback`);
        const sleep = (ms) => new Promise ((r) => setTimeout (r, ms));
        const open = (ws) => new Promise ((r) => ws.once ('open', r));
        const report = (name, t0, t1, chunks, parseOk, parseFail, extra = '') => {
            const ms = Number (t1 - t0) / 1e6;
            console.log (
                `${name.padEnd (37)} ${ms.toFixed (0).padStart (5)} ms  ${(N / (ms / 1000) / 1000).toFixed (0).padStart (4)}k msg/s  `
                + `chunks=${String (chunks).padStart (6)}  parseOk=${parseOk} parseFail=${parseFail} ${extra}`
            );
        };

        // 1. raw ws 'message' events (production WsClient shape)
        {
            const ws = new WsPackage (url);
            let t0, count = 0, ok = 0, fail = 0;
            await new Promise ((resolve) => {
                ws.on ('message', (data) => {
                    if (count === 0) t0 = process.hrtime.bigint ();
                    count++;
                    try { JSON.parse (data.toString ()); ok++; } catch (e) { fail++; }
                    if (count === N) resolve ();
                });
            });
            report ('1. raw ws "message" event', t0, process.hrtime.bigint (), count, ok, fail, `paused=${ws.isPaused}`);
            ws.terminate ();
        }

        // 2. duplex byte mode, flowing 'data' (fast consumer)
        {
            const ws = new WsPackage (url);
            const duplex = createWebSocketStream (ws); // attach BEFORE open: events in the open->attach gap are dropped
            let t0, bytes = 0, chunks = 0, ok = 0, fail = 0;
            await new Promise ((resolve) => {
                duplex.on ('data', (chunk) => {
                    if (chunks === 0) t0 = process.hrtime.bigint ();
                    chunks++;
                    bytes += chunk.length;
                    try { JSON.parse (chunk.toString ()); ok++; } catch (e) { fail++; }
                    if (bytes === N * PAYLOAD_BYTES) resolve ();
                });
            });
            report ('2. duplex byte-mode, flowing', t0, process.hrtime.bigint (), chunks, ok, fail);
            ws.terminate ();
        }

        // 3. duplex byte mode, for-await after a 150ms consumer stall:
        //    backpressure engages BUT buffering fuses message boundaries
        {
            const ws = new WsPackage (url);
            const duplex = createWebSocketStream (ws);
            await open (ws);
            let pausedSeen = false;
            const probe = setInterval (() => { if (ws.isPaused) pausedSeen = true; }, 10);
            await sleep (150);
            const buffered = duplex.readableLength;
            const t0 = process.hrtime.bigint ();
            let bytes = 0, chunks = 0, ok = 0, fail = 0, maxChunk = 0;
            for await (const chunk of duplex) {
                chunks++;
                bytes += chunk.length;
                maxChunk = Math.max (maxChunk, chunk.length);
                try { JSON.parse (chunk.toString ()); ok++; } catch (e) { fail++; }
                if (bytes === N * PAYLOAD_BYTES) break;
            }
            clearInterval (probe);
            report ('3. duplex byte-mode, stalled 150ms', t0, process.hrtime.bigint (), chunks, ok, fail,
                `pauseEngaged=${pausedSeen} bufferedAtStall=${buffered}B maxChunk=${maxChunk}B (payload=${PAYLOAD_BYTES}B)`);
            ws.terminate ();
        }

        // 4. duplex readableObjectMode, same stall: framing preserved AND
        //    backpressure engaged (the WsClientStreamFast configuration)
        {
            const ws = new WsPackage (url);
            const duplex = createWebSocketStream (ws, { readableObjectMode: true });
            await open (ws);
            let pausedSeen = false;
            const probe = setInterval (() => { if (ws.isPaused) pausedSeen = true; }, 10);
            await sleep (150);
            const buffered = duplex.readableLength; // counts messages in objectMode
            const t0 = process.hrtime.bigint ();
            let chunks = 0, ok = 0, fail = 0;
            for await (const msg of duplex) {
                chunks++;
                try { JSON.parse (msg); ok++; } catch (e) { fail++; }
                if (chunks === N) break;
            }
            clearInterval (probe);
            report ('4. duplex readableObjectMode, stalled', t0, process.hrtime.bigint (), chunks, ok, fail,
                `pauseEngaged=${pausedSeen} bufferedAtStall=${buffered}msgs`);
            ws.terminate ();
        }

        server.kill ();
        process.exit (0);
    });
}
