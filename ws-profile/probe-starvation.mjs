// Starvation probe — validates the reason ccxt sets allowSynchronousEvents:false.
//
// ccxt consumers run:  while (true) { const x = await ex.watchOrderBook (sym); }
// Every wakeup resolves AND DELETES the messageHash future; re-creating it via
// watchOrderBook crosses several awaits (multi-hop microtask chain) before
// client.future() runs again. If the transport delivers the next message
// before that chain drains, client.resolve() finds no future -> the user
// loop silently misses the update.
//
// This probe simulates that loop (with a configurable number of microtask
// hops before re-arming, default 3, standing in for loadMarkets()/market()
// hops inside watchOrderBook) against a server burst of N back-to-back
// messages, and reports wakeups/N for:
//   - ccxt            production WsClient (ws, allowSynchronousEvents:false)
//   - fast-deferred   WsClientStreamFast (setImmediate deferral, default)
//   - fast-nodefer    WsClientStreamFast with allowSynchronousEvents:true
//                     (the pre-fix behavior: microtask-per-message delivery)
// A correct client scores ~100%. Usage: node probe-starvation.mjs
import { WebSocketServer } from 'ws';
import { makeBroadcastVariants } from './common.mjs';

const PORT = 9615;
const BURST = 20000;
const REARM_HOPS = 3;

async function makeClient (impl, url) {
    let Ctor;
    let config = {};
    if (impl === 'ccxt') {
        ({ default: Ctor } = await import ('../js/src/base/ws/WsClient.js'));
    } else {
        ({ default: Ctor } = await import ('./WsClientStreamFast.mjs'));
        if (impl === 'fast-nodefer') {
            config = { options: { allowSynchronousEvents: true } };
        } else if (impl === 'fast-adaptive') {
            config = { options: { adaptiveDeferral: true } };
        }
    }
    let onDone = () => {};
    const client = new Ctor (
        url,
        (c, message) => {
            if (message === '__done__') {
                onDone ();
                return;
            }
            // what exchange handlers do: resolve the watch future (if armed)
            c.resolve (message, 'orderbook:ETH/USDT');
        },
        () => {},
        () => {},
        () => {},
        config
    );
    await client.connect (0);
    return { client, setOnDone: (cb) => { onDone = cb; } };
}

async function measure (impl, url) {
    const { client, setOnDone } = await makeClient (impl, url);
    let wakeups = 0;
    let running = true;
    // the user loop: await the future, then take REARM_HOPS microtask hops
    // before re-arming (models the awaits inside watchOrderBook before
    // client.future() runs again)
    const userLoop = (async () => {
        while (running) {
            const future = client.future ('orderbook:ETH/USDT');
            await future;
            wakeups++;
            for (let i = 0; i < REARM_HOPS; i++) {
                await Promise.resolve ();
            }
        }
    }) ();
    const done = new Promise ((resolve) => setOnDone (resolve));
    client.send ('__blast__' + JSON.stringify ({ count: BURST, kind: 'delta1k' })).catch (() => {});
    await done;
    await new Promise ((r) => setImmediate (r)); // let the last wakeup land
    running = false;
    client.resolve ({}, 'orderbook:ETH/USDT'); // unblock the loop so it can exit
    await userLoop;
    await client.close ();
    return {
        impl,
        burst: BURST,
        rearm_microtask_hops: REARM_HOPS,
        wakeups: wakeups - 1, // minus the synthetic unblock
        wakeup_pct: Math.round (((wakeups - 1) / BURST) * 1000) / 10,
    };
}

async function main () {
    const variants = { 'delta1k': makeBroadcastVariants ('delta1k') };
    const wss = new WebSocketServer ({ port: PORT, host: '127.0.0.1', perMessageDeflate: false });
    wss.on ('connection', (ws) => {
        ws.on ('error', () => {});
        ws.on ('message', (data) => {
            const str = data.toString ();
            if (str.startsWith ('__blast__')) {
                const cmd = JSON.parse (str.slice ('__blast__'.length));
                const { fulls } = variants[cmd.kind];
                let sent = 0;
                const pump = () => {
                    while (sent < cmd.count) {
                        if (ws.bufferedAmount > 4 * 1024 * 1024) {
                            setImmediate (pump);
                            return;
                        }
                        ws.send (fulls[sent & 63]);
                        sent++;
                    }
                    ws.send ('__done__');
                };
                pump ();
            }
        });
    });
    await new Promise ((r) => wss.on ('listening', r));
    const url = 'ws://127.0.0.1:' + PORT;
    const results = [];
    for (const impl of [ 'ccxt', 'fast-deferred', 'fast-adaptive', 'fast-nodefer' ]) {
        results.push (await measure (impl, url));
    }
    console.log ('PROBE ' + JSON.stringify (results, null, 2));
    wss.close ();
}

main ().then (() => process.exit (0)).catch ((e) => { console.error (e); process.exit (1); });
