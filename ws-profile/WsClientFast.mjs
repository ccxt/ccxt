// WsClientFast — production WsClient (raw `ws` events) with ADAPTIVE deferral.
// Transport-independent twin of WsClientStreamFast's delivery policy: no
// streams, no duplex — the same `ws` socket production uses, minus the
// unconditional one-event-loop-turn-per-message tax.
//
// Background (measured: results/deferral-modes.txt): production WsClient sets
// allowSynchronousEvents:false on node (WsClient.js createConnection), i.e.
// ws defers EVERY message emission by one setImmediate so that a
// `while (true) { await watchX () }` consumer can re-arm its future between
// resolves. That pause is paid whether or not anyone was woken — at the
// tick100 ceiling the client sits ~65% idle, capped near one message per
// event-loop turn.
//
// Adaptive policy here:
// - the ws socket is created with allowSynchronousEvents: true (synchronous
//   emission, no per-message immediates inside ws);
// - incoming messages are enqueued and dispatched by a synchronous drain
//   loop: messages nobody awaits (cache updates, unsubscribed topics,
//   deliveries while the consumer is mid-re-arm) flow at full speed;
// - after a dispatch that actually resolved an awaited future (the only case
//   where the consumer must re-arm before the next resolve), the drain yields
//   one event-loop turn (setImmediate) — microtasks drain first, so the
//   consumer is re-armed before the next dispatch;
// - a fairness yield every fairnessBatch (64) messages bounds event-loop lag;
// - backpressure: if the internal queue exceeds recvHighWaterMark (1024)
//   messages while deferring, connection.pause () stops socket reads (TCP
//   backpressure to the server); resume () once the queue fully drains.
//
// Options: { adaptiveDeferral: false } restores exact production behavior
// (allowSynchronousEvents:false, no queue, stock Client.onMessage).
// fairnessBatch / recvHighWaterMark tune the yield cadence / pause bound.
// Node-only prototype (browsers use the native WebSocket, which has no
// allowSynchronousEvents and delivers one message per task anyway).
import WsPackage from 'ws';
import WsClient from '../js/src/base/ws/WsClient.js';

export default class WsClientFast extends WsClient {

    createConnection () {
        const opts = this.options || {};
        this.adaptive = (opts['adaptiveDeferral'] !== false); // adaptive is the default
        if (!this.adaptive) {
            super.createConnection (); // exact production path
            return;
        }
        if (this.verbose) {
            this.log (new Date (), 'connecting to', this.url);
        }
        this.connectionStarted = Date.now ();
        this.setConnectionTimeout ();
        if (this.cookies !== undefined) {
            // same cookie handling as production WsClient.createConnection
            let cookieStr = '';
            const cookiesKeys = Object.keys (this.cookies);
            for (let i = 0; i < cookiesKeys.length; i++) {
                const key = cookiesKeys[i];
                cookieStr += key + '=' + this.cookies[key];
                if (i < cookiesKeys.length - 1) {
                    cookieStr += '; ';
                }
            }
            opts['headers'] = Object.assign (opts['headers'] || {}, { 'Cookie': cookieStr });
        }
        this.fairnessBatch = opts['fairnessBatch'] || 64;
        this.recvHighWaterMark = opts['recvHighWaterMark'] || 1024;
        this.queue = [];
        this.head = 0;
        this.batch = 0;
        this.draining = false;
        this.recvPaused = false;
        this.options = opts;
        this.options['allowSynchronousEvents'] = true; // we defer selectively instead
        // same wiring as production WsClient.createConnection (node branch)
        this.connection = new WsPackage (this.url, this.protocols, this.options);
        this.connection.onopen = this.onOpen.bind (this);
        this.connection.onmessage = this.onMessage.bind (this);
        this.connection.onerror = this.onError.bind (this);
        this.connection.onclose = this.onClose.bind (this);
        this.connection
            .on ('ping', this.onPing.bind (this))
            .on ('pong', this.onPong.bind (this))
            .on ('upgrade', this.onUpgrade.bind (this));
    }

    // raw ws event -> enqueue; dispatch via the drain loop so ws's synchronous
    // burst emission is decoupled from consumer-visible delivery
    onMessage (messageEvent) {
        if (!this.adaptive) {
            super.onMessage (messageEvent); // stock Client.onMessage
            return;
        }
        this.queue.push (messageEvent.data);
        if (!this.recvPaused && ((this.queue.length - this.head) > this.recvHighWaterMark)) {
            this.recvPaused = true;
            try { this.connection.pause (); } catch (e) { /* connecting/closed */ }
        }
        if (!this.draining) {
            this.draining = true;
            this.drainLoop ();
        }
    }

    drainLoop () {
        const queue = this.queue;
        for (;;) {
            if (this.head >= queue.length) {
                queue.length = 0;
                this.head = 0;
                this.draining = false;
                this.batch = 0;
                if (this.recvPaused) {
                    this.recvPaused = false;
                    try { this.connection.resume (); } catch (e) { /* closed */ }
                }
                return;
            }
            const message = queue[this.head];
            queue[this.head] = undefined;
            this.head++;
            this.wakeupPending = false;
            this.dispatchMessage (message);
            this.batch++;
            if (this.wakeupPending || (this.batch >= this.fairnessBatch)) {
                // yield one event-loop turn: pending microtasks (the consumer's
                // future re-arm chain) drain before the immediate fires
                this.batch = 0;
                setImmediate (() => this.drainLoop ());
                return;
            }
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

    // lean parse + dispatch, identical semantics to stock Client.onMessage
    // (ws event-target wrapper already delivers text frames as string,
    // binary as Buffer)
    dispatchMessage (message) {
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
