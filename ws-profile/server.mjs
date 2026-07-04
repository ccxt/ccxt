// Loopback benchmark server (always `ws`-based, run in its OWN process).
// Modes on one port:
//   - echo: any frame is echoed back verbatim (binary preserved)
//   - blast: a text control frame '__blast__ {"count":N,...}' makes the server
//     push N messages, then a '__done__' text frame. Options:
//       kind:  'delta1k' (default) | 'tick100' | 'snap20k'  payload shape/size
//       stamp: true  -> each message starts with {"t":<µs monotonic>,...} so a
//              same-host client can measure one-way delivery latency
//              (process.hrtime.bigint() is CLOCK_MONOTONIC, shared across
//              processes on one machine)
//       rate:  msgs/s pacing (0/absent = uncapped, socket-drain paced)
//   - idle: clients that never send anything just stay connected (memory test)
//
// Args: --port 9500 [--deflate] [--tls]
import { WebSocketServer } from 'ws';
import { createServer } from 'https';
import { readFileSync } from 'fs';
import { makeDeltas, makeBroadcastVariants, parseArgs } from './common.mjs';

const BLAST_HIGH_WATER = 4 * 1024 * 1024; // pause pushing above 4MB buffered

const VARIANTS = {
    'tick100': makeBroadcastVariants ('tick100'),
    'delta1k': makeBroadcastVariants ('delta1k'),
    'snap20k': makeBroadcastVariants ('snap20k'),
};

function attach (wss, deltas) {
    wss.on ('connection', (ws) => {
        ws.on ('error', () => {});
        ws.on ('message', (data, isBinary) => {
            if (!isBinary) {
                const str = data.toString ();
                if (str.startsWith ('__blast__')) {
                    const cmd = JSON.parse (str.slice ('__blast__'.length));
                    if (cmd.kind || cmd.stamp || cmd.rate) {
                        blastVariants (ws, cmd);
                    } else {
                        blast (ws, cmd.count, deltas); // legacy 1KB blast
                    }
                    return;
                }
                if (str === '__ping__') { // liveness probe from the harness
                    ws.send ('__pong__');
                    return;
                }
                if (str === '__close4001__') { // parity test: server-initiated close
                    ws.close (4001, 'server-close-test');
                    return;
                }
                if (str === '__destroy__') { // parity test: abrupt TCP teardown
                    ws._socket.destroy ();
                    return;
                }
                ws.send (str);
                return;
            }
            ws.send (data, { binary: true });
        });
    });
}

function blast (ws, count, deltas) {
    let sent = 0;
    const pump = () => {
        while (sent < count) {
            if (ws.bufferedAmount > BLAST_HIGH_WATER) {
                setImmediate (pump);
                return;
            }
            ws.send (deltas[sent & 63]);
            sent++;
        }
        ws.send ('__done__');
    };
    pump ();
}

function blastVariants (ws, cmd) {
    const { rests, fulls } = VARIANTS[cmd.kind || 'delta1k'];
    const count = cmd.count;
    const stamp = !!cmd.stamp;
    const rate = Number (cmd.rate || 0); // msgs/s, 0 = uncapped
    let sent = 0;
    const t0 = process.hrtime.bigint ();
    const makeMsg = () => {
        if (stamp) {
            const nowUs = (process.hrtime.bigint () / 1000n).toString ();
            return '{"t":' + nowUs + ',' + rests[sent & 63];
        }
        return fulls[sent & 63];
    };
    const pump = () => {
        const due = rate
            ? Math.min (count, Math.floor (Number ((process.hrtime.bigint () - t0) / 1000n) * rate / 1e6) + 1)
            : count;
        while (sent < due) {
            if (ws.bufferedAmount > BLAST_HIGH_WATER) {
                setImmediate (pump);
                return;
            }
            ws.send (makeMsg ());
            sent++;
        }
        if (sent < count) {
            setTimeout (pump, 1);
            return;
        }
        ws.send ('__done__');
    };
    pump ();
}

function main () {
    const args = parseArgs (process.argv.slice (2));
    const port = Number (args.port || 9500);
    const deltas = makeDeltas ();
    const wsOptions = {
        perMessageDeflate: args.deflate ? true : false,
        maxPayload: 64 * 1024 * 1024,
    };
    let wss;
    if (args.tls) {
        const server = createServer ({
            key: readFileSync ('/tmp/kilo/fetch-bench/key.pem'),
            cert: readFileSync ('/tmp/kilo/fetch-bench/cert.pem'),
        });
        wss = new WebSocketServer ({ server, ...wsOptions });
        attach (wss, deltas);
        server.listen (port, '127.0.0.1', () => {
            console.log ('LISTENING ' + port + ' tls=1 deflate=' + (args.deflate ? 1 : 0));
        });
    } else {
        wss = new WebSocketServer ({ port, host: '127.0.0.1', ...wsOptions });
        attach (wss, deltas);
        wss.on ('listening', () => {
            console.log ('LISTENING ' + port + ' tls=0 deflate=' + (args.deflate ? 1 : 0));
        });
    }
}

main ();
