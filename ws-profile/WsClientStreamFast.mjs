// WsClientStreamFast — ccxt WsClient over the `ws` duplex stream.
//
// Transport: the production `ws` socket wrapped with createWebSocketStream
// (sock, { readableObjectMode: true, readableHighWaterMark: 1024 }) and
// consumed with a bare `for await` loop. The duplex readable is the only
// buffer: ws emits messages chunk-synchronously, push() parks them in the
// stream's internal list (O(1)), and the async iterator delivers exactly one
// message per step on a fresh stack (a microtask boundary between every two
// deliveries — consumer code never runs inside ws's emission stack).
//
// Why readableObjectMode (measured: probe-duplex-modes.mjs ->
// results/duplex-modes.txt): byte mode fuses frames once anything buffers
// (99.8% JSON.parse failures in the probe); objectMode keeps 1 chunk = 1
// message. It survives because ws spreads caller options BEFORE forcing
// objectMode/writableObjectMode (ws@8.21.0 lib/stream.js). Only the readable
// half is used: sends go through sock.send () directly — the byte-mode
// writable would coerce strings to BINARY frames, and the send callback
// already provides the completion signal send () expects.
//
// Backpressure: when 1024 unread messages are buffered, duplex.push ()
// returns false and ws pauses the socket (TCP backpressure to the server);
// reading resumes it. This is a memory circuit breaker, not a flow-control
// strategy — it only engages when the process cannot keep up at all. The
// stream-default HWM of 16 flapped under sustained paced load (pause
// threshold and read-triggered resume one message apart — delivery p99
// 1.24-3.08 ms at 60k msg/s); 1024 never engages at sustainable rates.
//
// Delivery policy: NONE — no per-message deferral (production WsClient sets
// ws allowSynchronousEvents:false, one event-loop turn per message), no
// adaptive deferral, no options. Consequence, measured in
// probe-starvation.mjs: under a saturating burst a
// `while (true) { await watchX () }` consumer wakes for ~50% of messages
// (the per-message microtask boundary loses the multi-hop future re-arm
// race about half the time) vs 100% for production; every message is still
// processed and lands in the caches — the consumer's next wakeup sees the
// merged state, nothing is lost. At paced rates each message arrives in its
// own event-loop turn and wakeups are ~100% for both.
import WsPackage, { createWebSocketStream } from 'ws';
import Client from '../js/src/base/ws/Client.js';
import { Future } from '../js/src/base/ws/Future.js';

export default class WsClientStreamFast extends Client {

    createConnection () {
        if (this.verbose) {
            this.log (new Date (), 'connecting to', this.url);
        }
        this.connectionStarted = Date.now ();
        this.setConnectionTimeout ();
        const sock = new WsPackage (this.url, this.protocols, this.options);
        this.sock = sock;
        // attach the duplex synchronously with the socket: messages emitted
        // between 'open' and a later attachment would be dropped silently
        this.duplex = createWebSocketStream (sock, { readableObjectMode: true, readableHighWaterMark: 1024 });
        this.duplex.on ('error', () => {}); // teardown surfaces via sock 'error'/'close'
        this.streamOpen = false;
        // facade for base-class Client paths: Client.js calls
        // this.connection.close(1006) on connect timeout (terminate() is valid
        // in every readyState; ws rejects close(1006) once open) and
        // this.connection.ping() from keepAlive — a real protocol ping here
        this.connection = {
            ping: () => sock.ping (),
            close: () => sock.terminate (),
        };
        sock.on ('open', () => {
            this.streamOpen = true;
            this.deliverLoop ();
            this.onOpen ();
        });
        sock.on ('pong', () => {
            this.lastPong = Date.now ();
        });
        sock.on ('error', (e) => {
            this.streamOpen = false;
            this.onError (e);
        });
        sock.on ('close', (code, reason) => {
            this.streamOpen = false;
            this.onClose ({ code: code || 1006, reason: (reason && reason.toString ()) || '' });
        });
    }

    connect (backoffDelay = 0) {
        if (!this.startedConnecting) {
            this.startedConnecting = true;
            if (backoffDelay) {
                setTimeout (() => this.createConnection (), backoffDelay);
            } else {
                this.createConnection ();
            }
        }
        return this.connected;
    }

    isOpen () {
        return this.streamOpen === true;
    }

    async send (message) {
        if (this.verbose) {
            this.log (new Date (), 'sending', message);
        }
        message = (typeof message === 'string') ? message : JSON.stringify (message);
        const future = Future ();
        this.writeFrame (message).then (() => future.resolve (null), (e) => future.reject (e));
        return future;
    }

    // test helper (not a ccxt API): raw binary frame
    sendBinary (data) {
        return this.writeFrame (data);
    }

    // text/binary frame type follows the input type (string|Buffer); the
    // callback fires on flush — same completion contract as writer.write()
    writeFrame (data) {
        return new Promise ((resolve, reject) => {
            this.sock.send (data, (e) => (e ? reject (e) : resolve (null)));
        });
    }

    close () {
        if (this.disconnected === undefined) {
            this.disconnected = Future ();
        }
        try {
            this.sock.close (1000);
        } catch (e) {
            try { this.sock.terminate (); } catch (e2) { /* already closed */ }
        }
        return this.disconnected;
    }

    // one message per async-iterator step; the try/catch is required because
    // deliverLoop is fire-and-forget — an iterator rejection on abrupt close
    // would otherwise be an unhandled rejection (teardown itself propagates
    // via the sock 'error'/'close' handlers above)
    async deliverLoop () {
        try {
            for await (const message of this.duplex) {
                this.onMessage ({ data: message });
            }
        } catch (e) {
            // socket teardown propagates via sock 'error'/'close' handlers
        }
    }

    onMessage (messageEvent) {
        // objectMode duplex: text frames arrive as string (already
        // simdutf-decoded by ws), binary frames as Buffer
        let message = messageEvent.data;
        if (typeof message !== 'string') {
            if (this.gunzip || this.inflate) {
                super.onMessage ({ data: message }); // stock decompression path
                return;
            }
            message = this.decompressBinary ? message.toString () : message;
        }
        try {
            // inlined isJsonEncodedObject + stock big-int guard
            if ((typeof message === 'string') && ((message[0] === '{') || (message[0] === '['))) {
                message = JSON.parse (message.replace (/:(\d{15,}),/g, ':"$1",'));
            }
            if (this.verbose) {
                this.log (new Date (), 'onMessage', message);
            }
        } catch (e) {
            this.log (new Date (), 'onMessage JSON.parse', e, '|', this.url);
        }
        try {
            this.onMessageCallback (this, message);
        } catch (error) {
            this.reject (error);
        }
    }

}
