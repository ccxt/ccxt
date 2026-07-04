// Repro: undici 7.27.2 WebSocketStream crashes the WHOLE PROCESS when the
// connection closes UNCLEANLY while a writer lock is held.
// Root cause: #onSocketClose's unclean path calls
// `this.#writableStream?.abort(error)` without the `if (!locked)` guard used
// in the clean path (lib/web/websocket/stream/websocketstream.js), and
// WritableStream.abort() throws synchronously when locked — inside a socket
// 'close' event handler, so it becomes an uncaughtException.
// This matters for ccxt: a Client.send() implementation would naturally hold
// a persistent writer; any abrupt disconnect (network drop, exchange restart)
// would then kill the host process.
// The parent process spawns the victim as a child and reports its fate.
// Usage: node probe-stream-crash.mjs
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const VICTIM = `
import { WebSocketServer } from 'ws';
import { WebSocketStream } from 'undici';
const wss = new WebSocketServer({ port: 9614, host: '127.0.0.1' });
wss.on('connection', (ws) => ws.on('message', () => ws._socket.destroy())); // abrupt teardown
wss.on('listening', async () => {
    const s = new WebSocketStream('ws://127.0.0.1:9614');
    const { writable } = await s.opened;
    const writer = writable.getWriter();     // hold the lock, like a persistent send path would
    s.closed.catch(() => console.log('closed promise rejected (handled)'));
    writer.write('x').catch(() => {});       // triggers server-side destroy
    setTimeout(() => { console.log('SURVIVED'); process.exit(0); }, 2000);
});
`;

function runVictim (code) {
    return new Promise ((resolve) => {
        const child = spawn (process.execPath, [ '--input-type=module', '-e', code ], { stdio: [ 'ignore', 'pipe', 'pipe' ] });
        let out = '';
        let err = '';
        child.stdout.on ('data', (d) => { out += d; });
        child.stderr.on ('data', (d) => { err += d; });
        child.on ('exit', (exitCode) => resolve ({ exitCode, out, err }));
    });
}

async function main () {
    // case 1: writer lock held across unclean close
    const locked = await runVictim (VICTIM);
    // case 2: same scenario, but the lock is released after each write
    const released = await runVictim (VICTIM.replace (
        "writer.write('x').catch(() => {});",
        "const p = writer.write('x'); writer.releaseLock(); p.catch(() => {});"
    ));
    console.log ('PROBE ' + JSON.stringify ({
        writer_lock_held: {
            exit_code: locked.exitCode,
            survived: locked.out.includes ('SURVIVED'),
            crash: locked.err.split ('\n').filter ((l) => l.includes ('Error') || l.includes ('websocketstream')).slice (0, 3),
        },
        writer_lock_released_after_write: {
            exit_code: released.exitCode,
            survived: released.out.includes ('SURVIVED'),
        },
    }, null, 2));
}

main ().then (() => process.exit (0)).catch ((e) => { console.error (e); process.exit (1); });
