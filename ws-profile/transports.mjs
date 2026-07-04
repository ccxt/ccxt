// Uniform client-transport adapters. Each benchmark process picks ONE
// transport so GC/CPU accounting stays per-transport.
//
// Transports:
//   ws        - `ws` package, raw, event API (text frames -> string, like ws's
//               own EventTarget wrapper and any JSON consumer would need)
//   ws-async  - `ws` package with allowSynchronousEvents:false (the exact flag
//               ccxt's WsClient sets) to isolate that flag's cost
//   ccxt      - ccxt's built WsClient (js/src/base/ws/WsClient.js), full real
//               path incl. its internal JSON detection/parse in onMessage
//   ccxt-stream - same built ccxt Client upper layer, transport swapped to
//               undici's WebSocketStream (ws-profile/WsClientStream.mjs)
//   ccxt-stream-fast - profile-guided optimized variant (WsClientStreamFast.mjs)
//   undici    - `import { WebSocket } from 'undici'` (standalone 7.27.2)
//   global    - globalThis.WebSocket (node-bundled undici build)
//   stream    - `import { WebSocketStream } from 'undici'` (experimental)
import WsPackage from 'ws';
import { WebSocket as UndiciWebSocket, WebSocketStream as UndiciWebSocketStream } from 'undici';

export const TRANSPORTS = [ 'ws', 'ws-async', 'ccxt', 'ccxt-stream', 'ccxt-stream-fast', 'undici', 'global', 'stream' ];

function makeWhatwgAdapter (WsCtor, url, name) {
    return new Promise ((resolve, reject) => {
        const sock = new WsCtor (url);
        sock.binaryType = 'arraybuffer';
        let onMessage = () => {};
        sock.onopen = () => {
            resolve ({
                name,
                send: (data) => sock.send (data),
                setOnMessage: (cb) => { onMessage = cb; },
                close: () => new Promise ((res) => {
                    sock.onclose = () => res ();
                    sock.close (1000);
                }),
                raw: sock,
            });
        };
        sock.onerror = (e) => reject (new Error (name + ' connect error: ' + (e && e.message)));
        sock.onmessage = (event) => onMessage (event.data);
    });
}

function makeWsPackageAdapter (url, name, options) {
    return new Promise ((resolve, reject) => {
        const sock = new WsPackage (url, options);
        let onMessage = () => {};
        sock.on ('open', () => {
            resolve ({
                name,
                send: (data) => sock.send (data),
                setOnMessage: (cb) => { onMessage = cb; },
                close: () => new Promise ((res) => {
                    sock.once ('close', () => res ());
                    sock.close (1000);
                }),
                raw: sock,
            });
        });
        sock.on ('error', reject);
        // text frames -> string (what ws's own EventTarget wrapper does and
        // what any JSON consumer needs); binary stays Buffer
        sock.on ('message', (data, isBinary) => onMessage (isBinary ? data : data.toString ()));
    });
}

async function makeCcxtAdapter (url, flavor) {
    const { default: WsClient } = (flavor === 'stream')
        ? await import ('./WsClientStream.mjs')
        : (flavor === 'stream-fast')
            ? await import ('./WsClientStreamFast.mjs')
            : await import ('../js/src/base/ws/WsClient.js');
    let onMessage = () => {};
    const client = new WsClient (
        url,
        (_client, message) => onMessage (message), // full ccxt onMessage path already ran
        (_client, error) => { throw error; },
        () => {},
        () => {},
        {}
    );
    await client.connect (0);
    return {
        name: (flavor === 'ws') ? 'ccxt' : 'ccxt-' + flavor,
        send: (data) => {
            if (typeof data === 'string') {
                client.send (data).catch (() => {}); // real ccxt send path (Future + completion)
            } else if (flavor !== 'ws') {
                client.sendBinary (data).catch (() => {});
            } else {
                // ccxt's send() would JSON.stringify a Buffer; binary send is
                // not a ccxt code path, so go one level down for bin frames
                client.connection.send (data, { binary: true }, () => {});
            }
        },
        setOnMessage: (cb) => { onMessage = cb; },
        close: () => client.close (),
        raw: client,
    };
}

async function makeStreamAdapter (url) {
    const wss = new UndiciWebSocketStream (url);
    const { readable, writable } = await wss.opened;
    const reader = readable.getReader ();
    const writer = writable.getWriter ();
    let onMessage = () => {};
    let closed = false;
    (async () => {
        try {
            for (;;) {
                const { done, value } = await reader.read ();
                if (done) break;
                onMessage (value);
            }
        } catch (e) {
            if (!closed) throw e;
        }
    }) ();
    return {
        name: 'stream',
        send: (data) => { writer.write (data).catch (() => {}); },
        setOnMessage: (cb) => { onMessage = cb; },
        close: async () => {
            closed = true;
            try { wss.close ({ closeCode: 1000 }); } catch (e) { /* ignore */ }
            await wss.closed.catch (() => {});
        },
        raw: wss,
    };
}

export async function connectTransport (name, url) {
    switch (name) {
        case 'ws':
            return makeWsPackageAdapter (url, 'ws', { perMessageDeflate: false });
        case 'ws-async':
            return makeWsPackageAdapter (url, 'ws-async', { perMessageDeflate: false, allowSynchronousEvents: false });
        case 'ccxt':
            return makeCcxtAdapter (url, 'ws');
        case 'ccxt-stream':
            return makeCcxtAdapter (url, 'stream');
        case 'ccxt-stream-fast':
            return makeCcxtAdapter (url, 'stream-fast');
        case 'undici':
            return makeWhatwgAdapter (UndiciWebSocket, url, 'undici');
        case 'global':
            return makeWhatwgAdapter (globalThis.WebSocket, url, 'global');
        case 'stream':
            return makeStreamAdapter (url);
        default:
            throw new Error ('unknown transport ' + name);
    }
}
