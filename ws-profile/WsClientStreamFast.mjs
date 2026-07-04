// WsClientStreamFast — stream-semantics prototype, rebased (2026-07-04) from
// undici's WebSocketStream onto `ws` + createWebSocketStream (sock,
// { readableObjectMode: true }).
//
// Why (measured: probe-duplex-modes.mjs -> results/duplex-modes.txt):
// - undici's WebSocketStream has NO receive backpressure (probe-backpressure.mjs,
//   reported upstream as nodejs/undici#5503): a stalled consumer buffers every
//   message in-process, unbounded.
// - the ws duplex in readableObjectMode is the only stream mode that preserves
//   message framing AND applies real backpressure at full throughput:
//   byte mode fuses frames once anything buffers (99.8% JSON.parse failures in
//   the probe), while objectMode keeps 1 chunk = 1 message and pauses the
//   socket once readableHighWaterMark messages are buffered (duplex.push()
//   === false -> ws.pause() -> TCP backpressure to the server; ~25 buffered
//   msgs in the probe at the stream-default HWM 16, 1024 here — see below).
// readableObjectMode survives because ws spreads user options BEFORE forcing
// objectMode/writableObjectMode (ws@8.21.0 lib/stream.js). Only the readable
// half of the duplex is used: sends go through sock.send() directly — the
// byte-mode writable would coerce strings to BINARY frames, and the send
// callback already provides the completion signal WsClientStream.send expects.
//
// Obsoleted by the rebase (they were undici workarounds — see git history):
// persistent-writer + writable.abort interposition (crash on unclean close),
// the eager-pull O(1) queue (undici's unbounded webstreams queue with O(n)
// shift), the zero-copy Buffer.toString fix (objectMode already delivers
// simdutf-decoded strings), and the fake ping() facade (protocol ping/pong is
// real again).
//
// Kept (transport-independent semantics, unchanged from the profiled variant):
// - anti-starvation deferral, ADAPTIVE by default: after a delivery that
//   actually resolved an awaited future (a consumer wakeup), yield one
//   event-loop turn (setImmediate) so the `while (true) { await watchX () }`
//   loop re-arms before the next resolve; messages nobody awaits (cache
//   updates, unsubscribed topics, deliveries while the consumer is mid-hop)
//   flow at full speed, with a fairness yield every fairnessBatch (64)
//   messages to bound event-loop lag. Starvation probe: 100% consumer
//   wakeups — same guarantee as production's per-message deferral — at
//   +10..+66% of production's ceiling (results/deferral-modes.txt). Strict
//   per-message deferral (exact ws allowSynchronousEvents:false semantics):
//   { options: { adaptiveDeferral: false } }. No deferral at all:
//   { options: { allowSynchronousEvents: true } } (drops ~half the wakeups
//   under burst — measured, not recommended). While the loop waits, unread
//   messages sit in the duplex (readableHighWaterMark, default 1024) and
//   throttle the SERVER via TCP instead of ballooning in-process. No queue
//   of our own anywhere: the duplex readable is the only buffer, and it is
//   what delivers per-message granularity (ws emission is chunk-synchronous;
//   the stream decouples dispatch from it).
// - lean onMessage: inlined JSON detection + big-int guard, error containment.
//
// Standalone: extends the BUILT ccxt Client directly (js/src/base/ws/Client.js)
// so the futures/resolve/keepAlive upper layer stays byte-identical to
// production; the undici-based WsClientStream.mjs (kept for comparison) is no
// longer a dependency of this file.
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
        // between 'open' and a later attachment would be dropped silently.
        // readableHighWaterMark (messages, objectMode) is the receive-
        // backpressure bound: ws pauses the socket when the duplex buffers
        // this many unread messages (stream.js: push() === false -> pause(),
        // resume on read). The stream default (16) flapped under sustained
        // paced load - pause threshold and read-triggered resume are one
        // message apart, so the socket chattered at the boundary (measured:
        // paced 60k/s delivery p99 1.24-3.08 ms vs 0.8 ms unflapped). 1024
        // makes backpressure a memory circuit breaker (~1 MB at 1 KB msgs)
        // that never engages at rates a consumer can sustain, matching the
        // bound the internal-queue variant used.
        const recvHighWaterMark = (this.options && this.options['recvHighWaterMark']) || 1024;
        this.duplex = createWebSocketStream (sock, { readableObjectMode: true, readableHighWaterMark: recvHighWaterMark });
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

    // paced delivery over the duplex readable. Between iterations the unread
    // backlog stays inside the duplex/kernel, so the deferral now *throttles
    // the server* instead of growing an in-process queue.
    async deliverLoop () {
        const opts = this.options || {};
        const defer = !opts['allowSynchronousEvents'];
        const adaptive = (opts['adaptiveDeferral'] !== false); // adaptive is the default
        const fairnessBatch = opts['fairnessBatch'] || 64;
        let batch = 0;
        try {
            for await (const message of this.duplex) {
                this.wakeupPending = false;
                this.onMessage ({ data: message });
                if (defer) {
                    batch++;
                    if (!adaptive || this.wakeupPending || (batch >= fairnessBatch)) {
                        batch = 0;
                        await new Promise ((resolve) => setImmediate (resolve));
                    }
                }
            }
        } catch (e) {
            // socket teardown propagates via sock 'error'/'close' handlers
        }
    }

    // adaptive-deferral hooks: record whether a dispatch resolved/rejected a
    // future someone was actually awaiting (only then does the consumer need
    // an event-loop turn to re-arm before the next delivery)
    resolve (result, messageHash) {
        if ((messageHash !== undefined) && (this.futures !== undefined) && (messageHash in this.futures)) {
            this.wakeupPending = true;
        }
        return super.resolve (result, messageHash);
    }

    reject (result, messageHash = undefined) {
        this.wakeupPending = true; // conservative: rejections always yield
        return super.reject (result, messageHash);
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
