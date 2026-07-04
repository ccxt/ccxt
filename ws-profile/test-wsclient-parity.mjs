// Functional parity test: ccxt's production WsClient (over `ws`) vs the
// WebSocketStream-backed refactor (WsClientStream.mjs). Both share the SAME
// built ccxt Client upper layer; this exercises every WsClient contract that
// ccxt exchanges rely on and reports PASS / FAIL / DIVERGENT per behavior.
// Runs its own echo server in-process (behavior test, not a perf benchmark).
// Usage: node test-wsclient-parity.mjs
import { WebSocketServer } from 'ws';
import { gzipSync, deflateRawSync } from 'zlib';

const PORT = 9612;

function makeClientHarness () {
    const events = { messages: [], errors: [], closes: [], connected: 0 };
    return {
        events,
        callbacks: [
            (_client, message) => events.messages.push (message),
            (_client, error) => events.errors.push (error),
            (_client, event) => events.closes.push (event),
            () => { events.connected++; },
        ],
    };
}

async function makeClient (impl, url, config = {}) {
    const { default: Ctor } = (impl === 'stream')
        ? await import ('./WsClientStream.mjs')
        : (impl === 'stream-fast')
            ? await import ('./WsClientStreamFast.mjs')
            : await import ('../js/src/base/ws/WsClient.js');
    const h = makeClientHarness ();
    const client = new Ctor (url, h.callbacks[0], h.callbacks[1], h.callbacks[2], h.callbacks[3], config);
    return { client, events: h.events };
}

function sendRawBinary (impl, client, buf) {
    if (impl !== 'ws') {
        return client.sendBinary (buf);
    }
    // production WsClient: one level below client.send (which would
    // JSON.stringify a Buffer); same frame on the wire
    return new Promise ((res, rej) => client.connection.send (buf, { binary: true }, (e) => (e ? rej (e) : res ())));
}

function waitFor (fn, timeoutMs = 3000, interval = 10) {
    return new Promise ((resolve, reject) => {
        const t0 = Date.now ();
        const timer = setInterval (() => {
            if (fn ()) {
                clearInterval (timer);
                resolve (true);
            } else if (Date.now () - t0 > timeoutMs) {
                clearInterval (timer);
                reject (new Error ('timeout waiting for condition'));
            }
        }, interval);
    });
}

async function runSuite (impl, url) {
    const r = {};
    // 1. connect: connected future resolves with url, onConnected fires, isOpen()
    {
        const { client, events } = await makeClient (impl, url);
        const resolved = await client.connect (0);
        r['connect_future_resolves_with_url'] = (resolved === url);
        r['onConnected_callback_fired'] = (events.connected === 1);
        r['isOpen_true_after_connect'] = (client.isOpen () === true);
        // 2. exchange-style future/resolve flow with full JSON parse path
        const future = client.future ('orderbook:BTC/USDT');
        const origOnMessage = client.onMessageCallback;
        client.onMessageCallback = (c, message) => {
            origOnMessage (c, message);
            if (message && message.e === 'depthUpdate') {
                c.resolve (message, 'orderbook:BTC/USDT');
            }
        };
        await client.send ('{"e":"depthUpdate","E":1581358737706,"s":"ETHBTC","b":[["0.062","1.0"]]}');
        const result = await Promise.race ([ future, new Promise ((_, rej) => setTimeout (() => rej (new Error ('future timeout')), 3000)) ]);
        r['future_resolved_via_onMessage'] = (typeof result === 'object' && result.e === 'depthUpdate');
        r['json_text_frame_parsed_to_object'] = (typeof events.messages[0] === 'object');
        // 3. big-int guard regex applied (Client.onMessage replaces 15+ digit ints)
        client.onMessageCallback = (c, message) => events.messages.push (message);
        await client.send ('{"id":12345678901234567890,"x":1}');
        await waitFor (() => events.messages.length >= 2);
        const bigIntMsg = events.messages[events.messages.length - 1];
        r['bigint_guard_regex_applied'] = (typeof bigIntMsg === 'object' && bigIntMsg.id === '12345678901234567890');
        // 4. send() future resolves (write-completion signal)
        let sendResolved = false;
        await client.send ('{"ping":1}').then (() => { sendResolved = true; });
        r['send_future_resolves'] = sendResolved;
        // 5. uncompressed BINARY frame carrying JSON (decompressBinary path)
        const jsonBytes = Buffer.from ('{"binary":true,"v":42}', 'utf8');
        const before = events.messages.length;
        await sendRawBinary (impl, client, jsonBytes);
        await waitFor (() => events.messages.length > before);
        const binMsg = events.messages[events.messages.length - 1];
        r['binary_json_frame_parsed'] = (typeof binMsg === 'object' && binMsg.binary === true)
            ? true
            : ('DIVERGENT: got ' + (typeof binMsg) + ' ' + String (binMsg).slice (0, 60));
        // 6. client.close() resolves disconnected + onClose fires
        await Promise.race ([ client.close (), new Promise ((_, rej) => setTimeout (() => rej (new Error ('close timeout')), 3000)) ]);
        r['close_resolves_disconnected'] = true;
        await waitFor (() => events.closes.length >= 1).catch (() => {});
        r['onClose_callback_fired'] = (events.closes.length >= 1);
    }
    // 7. gunzip:true — gzipped binary frame decoded + parsed (Client.onMessage path)
    {
        const { client, events } = await makeClient (impl, url, { gunzip: true });
        await client.connect (0);
        const gz = gzipSync (Buffer.from ('{"gunzip":true,"v":7}', 'utf8'));
        await sendRawBinary (impl, client, gz);
        await waitFor (() => events.messages.length >= 1);
        const msg = events.messages[0];
        r['gunzip_binary_frame_parsed'] = (typeof msg === 'object' && msg.gunzip === true)
            ? true
            : ('DIVERGENT: got ' + (typeof msg) + ' ' + String (msg).slice (0, 60));
        await client.close ();
    }
    // 7b. inflate:true — raw-deflate binary frame (e.g. some exchanges)
    {
        const { client, events } = await makeClient (impl, url, { inflate: true });
        await client.connect (0);
        const defl = deflateRawSync (Buffer.from ('{"inflate":true,"v":8}', 'utf8'));
        await sendRawBinary (impl, client, defl);
        await waitFor (() => events.messages.length >= 1);
        const msg = events.messages[0];
        r['inflate_binary_frame_parsed'] = (typeof msg === 'object' && msg.inflate === true)
            ? true
            : ('DIVERGENT: got ' + (typeof msg) + ' ' + String (msg).slice (0, 60));
        await client.close ();
    }
    // 8. server-initiated close: code propagates to onClose, futures rejected
    {
        const { client, events } = await makeClient (impl, url);
        await client.connect (0);
        const pendingFuture = client.future ('never:resolved');
        pendingFuture.catch (() => {});
        client.send ('__close4001__').catch (() => {});
        await waitFor (() => events.closes.length >= 1);
        r['server_close_code_propagated'] = (events.closes[0] && Number (events.closes[0].code) === 4001)
            ? true
            : ('DIVERGENT: got code ' + (events.closes[0] && events.closes[0].code));
        let futureRejected = false;
        await pendingFuture.catch (() => { futureRejected = true; });
        r['pending_futures_rejected_on_server_close'] = futureRejected;
    }
    // 9. abrupt TCP destroy: onError and/or onClose(1006), futures rejected
    {
        const { client, events } = await makeClient (impl, url);
        await client.connect (0);
        const pendingFuture = client.future ('never:resolved2');
        pendingFuture.catch (() => {});
        client.send ('__destroy__').catch (() => {});
        await waitFor (() => (events.closes.length >= 1 || events.errors.length >= 1), 5000);
        let futureRejected = false;
        await Promise.race ([
            pendingFuture.catch (() => { futureRejected = true; }),
            new Promise ((res) => setTimeout (res, 2000)),
        ]);
        r['abrupt_destroy_detected'] = {
            onError_fired: events.errors.length >= 1,
            onClose_fired: events.closes.length >= 1,
            close_code: events.closes[0] ? events.closes[0].code : undefined,
            pending_futures_rejected: futureRejected,
        };
    }
    return r;
}

async function main () {
    const wss = new WebSocketServer ({ port: PORT, host: '127.0.0.1', perMessageDeflate: false, maxPayload: 64 * 1024 * 1024 });
    wss.on ('connection', (ws) => {
        ws.on ('error', () => {});
        ws.on ('message', (data, isBinary) => {
            if (!isBinary) {
                const str = data.toString ();
                if (str === '__close4001__') {
                    ws.close (4001, 'server-close-test');
                    return;
                }
                if (str === '__destroy__') {
                    ws._socket.destroy ();
                    return;
                }
                ws.send (str);
                return;
            }
            ws.send (data, { binary: true });
        });
    });
    await new Promise ((r) => wss.on ('listening', r));
    const url = 'ws://127.0.0.1:' + PORT;
    const report = {
        'WsClient (ws, production)': await runSuite ('ws', url),
        'WsClientStream (undici WebSocketStream)': await runSuite ('stream', url),
        'WsClientStreamFast (optimized)': await runSuite ('stream-fast', url),
    };
    console.log ('PARITY ' + JSON.stringify (report, null, 2));
    wss.close ();
}

main ().then (() => process.exit (0)).catch ((e) => { console.error (e); process.exit (1); });
