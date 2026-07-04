// Behavior / API-surface probe relevant to ccxt's ts/src/base/ws/Client.ts +
// WsClient.ts. Not a perf benchmark — server runs in-process.
// Usage: node probe-behavior.mjs
import { WebSocketServer } from 'ws';
import WsPackage from 'ws';
import { WebSocket as UndiciWebSocket, WebSocketStream as UndiciWebSocketStream, Agent } from 'undici';

const PORT = 9610;

function once (emitter, event) {
    return new Promise ((resolve) => emitter.once (event, resolve));
}

async function main () {
    const report = {};
    // server WITH permessage-deflate enabled, records negotiated extensions +
    // request headers per connection
    const wss = new WebSocketServer ({ port: PORT, host: '127.0.0.1', perMessageDeflate: true });
    let lastConn = null;
    wss.on ('connection', (ws, req) => {
        lastConn = { extensions: String (ws.extensions), headers: req.headers };
        ws.on ('message', (data, isBinary) => ws.send (data, { binary: isBinary }));
    });
    await once (wss, 'listening');
    const url = 'ws://127.0.0.1:' + PORT;
    const settle = () => new Promise ((r) => setTimeout (r, 100));

    // ---- ws package ----
    {
        const sock = new WsPackage (url, { perMessageDeflate: true, headers: { 'x-probe': 'ws' } });
        await once (sock, 'open');
        await settle ();
        const gotPong = new Promise ((r) => sock.once ('pong', () => r (true)));
        sock.ping ();
        report['ws'] = {
            negotiated_extensions_server_side: lastConn.extensions,
            custom_headers_received: lastConn.headers['x-probe'] === 'ws',
            has_ping_method: typeof sock.ping === 'function',
            pong_event_observable: await Promise.race ([ gotPong, settle ().then (() => false) ]),
            has_bufferedAmount: typeof sock.bufferedAmount === 'number',
            send_completion_callback: true, // ws.send(data, opts, cb) — used by ccxt Client.send
            agent_proxy_option: 'options.agent (http.Agent / https.Agent, e.g. https-proxy-agent)',
        };
        // close-code propagation
        const closeInfo = new Promise ((r) => sock.once ('close', (code, reason) => r ({ code, reason: reason.toString () })));
        for (const client of wss.clients) client.close (4001, 'probe-close');
        report['ws'].close_code_propagation = await closeInfo;
    }

    // ---- undici WebSocket (module) ----
    {
        let headersAccepted = true;
        let sock;
        try {
            sock = new UndiciWebSocket (url, { headers: { 'x-probe': 'undici' } });
        } catch (e) {
            headersAccepted = false;
            sock = new UndiciWebSocket (url);
        }
        await new Promise ((res, rej) => { sock.onopen = res; sock.onerror = (e) => rej (new Error (String (e.message))); });
        await settle ();
        report['undici'] = {
            headers_option_accepted: headersAccepted,
            custom_headers_received: lastConn.headers['x-probe'] === 'undici',
            negotiated_extensions_server_side: lastConn.extensions,
            client_extensions_property: sock.extensions,
            has_ping_method: typeof sock.ping === 'function',
            has_bufferedAmount: typeof sock.bufferedAmount === 'number',
            send_completion_callback: false, // WHATWG send() returns void
        };
        // dispatcher (proxy) support probe: count dispatches through a custom Agent
        let dispatched = false;
        const agent = new Agent ();
        const origDispatch = agent.dispatch.bind (agent);
        agent.dispatch = (opts, handler) => { dispatched = true; return origDispatch (opts, handler); };
        const sock2 = new UndiciWebSocket (url, { dispatcher: agent });
        await new Promise ((res, rej) => { sock2.onopen = res; sock2.onerror = () => rej (new Error ('dispatcher connect failed')); });
        report['undici'].dispatcher_option_used = dispatched;
        const closeInfo = new Promise ((r) => { sock.onclose = (e) => r ({ code: e.code, reason: e.reason }); });
        for (const client of wss.clients) client.close (4001, 'probe-close');
        report['undici'].close_code_propagation = await closeInfo;
        sock2.close ();
    }

    await settle ();

    // ---- global WebSocket (node-bundled undici) ----
    {
        let headersAccepted = true;
        let sock;
        try {
            sock = new globalThis.WebSocket (url, { headers: { 'x-probe': 'global' } });
        } catch (e) {
            headersAccepted = false;
            sock = new globalThis.WebSocket (url);
        }
        await new Promise ((res, rej) => { sock.onopen = res; sock.onerror = (e) => rej (new Error (String (e.message))); });
        await settle ();
        report['global'] = {
            headers_option_accepted: headersAccepted,
            custom_headers_received: lastConn.headers['x-probe'] === 'global',
            negotiated_extensions_server_side: lastConn.extensions,
            client_extensions_property: sock.extensions,
            has_ping_method: typeof sock.ping === 'function',
            has_bufferedAmount: typeof sock.bufferedAmount === 'number',
        };
        sock.close ();
    }

    await settle ();

    // ---- undici WebSocketStream ----
    {
        const wsstream = new UndiciWebSocketStream (url);
        const opened = await wsstream.opened;
        await settle ();
        report['stream'] = {
            negotiated_extensions_server_side: lastConn.extensions,
            opened_keys: Object.keys (opened),
            readable_is_stream: opened.readable instanceof ReadableStream,
            writable_is_stream: opened.writable instanceof WritableStream,
            backpressure: 'yes — WHATWG streams: writer.write() promises + reader pull',
            has_ping_method: false,
        };
        wsstream.close ({ closeCode: 1000 });
        await wsstream.closed.catch (() => {});
    }

    // ---- text/binary delivered types (against deflate server; types identical on plain) ----
    {
        const typeOf = (v) => (typeof v === 'string') ? 'string' : (v && v.constructor ? v.constructor.name : typeof v);
        const results = {};
        // ws
        {
            const sock = new WsPackage (url, { perMessageDeflate: false });
            await once (sock, 'open');
            const got = [];
            sock.on ('message', (data, isBinary) => got.push ({ isBinary, type: typeOf (data) }));
            sock.send ('hello');
            sock.send (Buffer.from ([ 1, 2, 3 ]));
            await settle ();
            results['ws'] = got;
            sock.close ();
        }
        // undici
        {
            const sock = new UndiciWebSocket (url);
            sock.binaryType = 'arraybuffer';
            await new Promise ((res) => { sock.onopen = res; });
            const got = [];
            sock.onmessage = (e) => got.push ({ type: typeOf (e.data) });
            sock.send ('hello');
            sock.send (new Uint8Array ([ 1, 2, 3 ]));
            await settle ();
            results['undici (binaryType=arraybuffer)'] = got;
            const sock2 = new UndiciWebSocket (url); // default binaryType
            await new Promise ((res) => { sock2.onopen = res; });
            const got2 = [];
            sock2.onmessage = (e) => got2.push ({ type: typeOf (e.data) });
            sock2.send (new Uint8Array ([ 1, 2, 3 ]));
            await settle ();
            results['undici (default binaryType)'] = got2;
            sock.close ();
            sock2.close ();
        }
        // stream
        {
            const wsstream = new UndiciWebSocketStream (url);
            const { readable, writable } = await wsstream.opened;
            const writer = writable.getWriter ();
            const reader = readable.getReader ();
            await writer.write ('hello');
            await writer.write (new Uint8Array ([ 1, 2, 3 ]));
            const a = await reader.read ();
            const b = await reader.read ();
            results['stream'] = [ { type: typeOf (a.value) }, { type: typeOf (b.value) } ];
            wsstream.close ({ closeCode: 1000 });
        }
        report['frame_data_types'] = results;
    }

    // ---- permessage-deflate 20KB round-trip integrity (deflate server) ----
    {
        const { makePayload } = await import ('./common.mjs');
        const big = makePayload ('json20k').data;
        const results = {};
        // ws with deflate offered
        {
            const sock = new WsPackage (url, { perMessageDeflate: true });
            await once (sock, 'open');
            const reply = new Promise ((r) => sock.once ('message', (d) => r (d.toString ())));
            sock.send (big);
            results['ws'] = { negotiated: String (sock.extensions), roundtrip_intact: (await reply) === big };
            sock.close ();
        }
        // undici module
        {
            const sock = new UndiciWebSocket (url);
            await new Promise ((res) => { sock.onopen = res; });
            const reply = new Promise ((r) => { sock.onmessage = (e) => r (e.data); });
            sock.send (big);
            results['undici'] = { negotiated: sock.extensions, roundtrip_intact: (await reply) === big };
            sock.close ();
        }
        // global
        {
            const sock = new globalThis.WebSocket (url);
            await new Promise ((res) => { sock.onopen = res; });
            const reply = new Promise ((r) => { sock.onmessage = (e) => r (e.data); });
            sock.send (big);
            results['global'] = { negotiated: sock.extensions, roundtrip_intact: (await reply) === big };
            sock.close ();
        }
        // stream
        {
            const wsstream = new UndiciWebSocketStream (url);
            const opened = await wsstream.opened;
            const writer = opened.writable.getWriter ();
            const reader = opened.readable.getReader ();
            await writer.write (big);
            const { value } = await reader.read ();
            results['stream'] = { negotiated: opened.extensions, roundtrip_intact: value === big };
            wsstream.close ({ closeCode: 1000 });
        }
        report['permessage_deflate_20kb'] = results;
    }

    // ---- WebSocketStream: are headers / dispatcher options honored? ----
    {
        let dispatched = false;
        const agent = new Agent ();
        const origDispatch = agent.dispatch.bind (agent);
        agent.dispatch = (opts, handler) => { dispatched = true; return origDispatch (opts, handler); };
        const wsstream = new UndiciWebSocketStream (url, { headers: { 'x-probe': 'stream' }, dispatcher: agent });
        await wsstream.opened;
        await settle ();
        report['stream_options'] = {
            headers_option_honored: lastConn.headers['x-probe'] === 'stream',
            dispatcher_option_honored: dispatched,
        };
        wsstream.close ({ closeCode: 1000 });
    }

    console.log ('PROBE ' + JSON.stringify (report, null, 2));
    wss.close ();
}

main ().then (() => process.exit (0)).catch ((e) => { console.error (e); process.exit (1); });
