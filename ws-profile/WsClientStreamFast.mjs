// WsClientStreamFast — profile-guided optimization of WsClientStream.
// (see WS-PROFILE-FINDINGS.md §8.5 for the flame-graph evidence behind each change)
//
// Optimizations vs WsClientStream.mjs:
//
// 1. BINARY FRAMES: zero-copy Buffer view over the incoming Uint8Array before
//    Client.onMessage. Flame graph (bin1k echo): Client.onMessage self time was
//    51.6% of the whole process because Uint8Array.toString() is
//    Array.prototype.join (comma-joined byte list), while Buffer.toString() is
//    simdutf UTF-8 decode. Also fixes the §8.2 parity divergence.
//
// 2. PERSISTENT WRITER: hold one writer for the connection lifetime instead of
//    acquire→write→releaseLock per send. Flame graph (bin1k echo): the
//    releaseLock churn (writableStreamDefaultWriterRelease →
//    EnsureReadyPromiseRejected + setPromiseHandled) was ~8% of process time.
//    The §8.1 crash (undici's unguarded writableStream.abort() on unclean
//    close while locked) is defused by interposing an own-property `abort` on
//    OUR writable that releases the lock first, then delegates to the real
//    WritableStream.prototype.abort. Public API surface only, but clearly a
//    workaround — the honest fix belongs in undici.
//
// 3. LEAN onMessage: same observable semantics as Client.onMessage (JSON
//    detection, big-int guard regex, JSON.parse, verbose logging, error
//    containment; gunzip/inflate delegate to the stock path), minus the
//    redundant message.toString() on strings and double typeof checks.
//    Receive flame graphs show onMessage self time is JSON.parse-dominated
//    (67.8% broadcast) so gains here are modest by design: the parse itself is
//    ccxt semantics and V8-native.
//
// 4. ANTI-STARVATION DEFERRAL (allowSynchronousEvents:false equivalent).
//    ccxt user code looks like:
//        while (true) { const book = await ex.watchOrderBook ('ETH/USDT'); }
//    Each wakeup resolves AND DELETES the messageHash future; the user loop
//    then needs SEVERAL microtask hops (watchOrderBook crosses multiple awaits
//    before client.future() re-creates the future). If the transport delivers
//    the next message before that chain drains, client.resolve() finds no
//    future and the user silently misses the wakeup. A microtask boundary is
//    NOT enough (the next read's continuation would interleave after the
//    user's first hop); only a macrotask drains the whole chain. So, like
//    ws's allowSynchronousEvents:false path (receiver.js DEFER_EVENT →
//    setImmediate), the read loop awaits one setImmediate AFTER each
//    delivery, before pulling the next message. Difference kept in our
//    favour: ws defers every message BEFORE delivery (isolated messages pay
//    +1 loop turn of latency); here the message is delivered immediately and
//    the immediate only gates the NEXT pull, so isolated/paced messages keep
//    the low-latency path while burst delivery still yields one full event
//    loop turn per message. Opt out with config
//    { options: { allowSynchronousEvents: true } } (mirrors the ws option).
//    Cost: the small-message drain ceiling drops to ~1 message per event-loop
//    turn, same as production — measured in WS-PROFILE-FINDINGS.md.
//
// NOT fixable at this layer (undici-internal, visible in the json20k flame
// graph): client→server frame MASKING in JS (createFrame 13.4% self),
// TextEncoder.encode of outgoing text (4.1%) and the webstreams write queue
// (~9-17%) — `ws` masks via the native bufferutil addon and has no stream
// queue, which is why send-heavy 20KB scenarios stay faster on `ws`.
// WebSocketStream also can NOT deliver partial messages: undici's receiver
// assembles complete frames/fragments before enqueueing (receiver.js
// consumeFragments), so parse-while-receiving is impossible at this API level.
import WsClientStream from './WsClientStream.mjs';

export default class WsClientStreamFast extends WsClientStream {

    createConnection () {
        super.createConnection ();
        // once opened, replace the per-send acquire/release pattern with a
        // persistent writer + crash-defusing abort interposition (opt. 2)
        this.wss.opened.then (({ writable }) => {
            this.persistentWriter = writable.getWriter ();
            const client = this;
            const origAbort = writable.abort.bind (writable);
            writable.abort = function abortUnlockingFirst (reason) {
                // undici #onSocketClose calls writable.abort(error) synchronously
                // on unclean close; WritableStream.abort() throws if locked.
                // Release our writer first so it aborts instead of crashing node.
                try {
                    client.persistentWriter.releaseLock ();
                } catch (e) { /* already released */ }
                return origAbort (reason);
            };
        }).catch (() => {});
    }

    writeFrame (data) {
        if (this.persistentWriter === undefined) {
            // belt-and-braces: acquire lazily if a send beats the opened handler
            this.persistentWriter = this.writable.getWriter ();
        }
        return this.persistentWriter.write (data);
    }

    // opt. 4: anti-starvation deferral — deliver each message, then yield one
    // full event-loop turn (setImmediate) before delivering the next, so a
    // `while (true) { await watchX () }` consumer's multi-hop microtask chain
    // re-creates its future before the next resolve. Mirrors the semantics of
    // ws's allowSynchronousEvents:false (which ccxt's WsClient always sets on
    // node), but delivers the current message without the extra turn of
    // latency that ws adds even to isolated messages.
    //
    // Implementation note (measured, not hypothetical): ws can afford to just
    // PAUSE its parser between immediates because the unread bytes then apply
    // TCP backpressure to the server. undici's WebSocketStream has no receive
    // backpressure (probe-backpressure.mjs), so pausing reader.read() lets the
    // internal webstreams queue balloon, and node's dequeueValue does
    // queue.shift() — O(queue length) — which went quadratic under an uncapped
    // blast (tick100 ceiling collapsed to 9,279 msg/s at 108µs CPU/msg). So a
    // detached microtask pull-loop keeps undici's queue empty and buffers into
    // OUR queue with an O(1) head index; delivery pulls from it one message
    // per event-loop turn. Consequence to document: under sustained producer
    // overload the backlog buffers in-process (no TCP backpressure exists at
    // this API level) instead of throttling the server like ws does.
    async readLoop (readable) {
        const reader = readable.getReader ();
        const defer = !(this.options && this.options['allowSynchronousEvents']);
        if (!defer) {
            try {
                for (;;) {
                    const { done, value } = await reader.read ();
                    if (done) {
                        break;
                    }
                    this.onMessage ({ data: value });
                }
            } catch (e) {
                // error propagation is handled via this.wss.closed
            }
            return;
        }
        const queue = [];
        let head = 0;
        let readerDone = false;
        let wake = null;
        // eager pull: drains undici's internal queue at microtask speed so it
        // never grows; our queue absorbs the burst with O(1) dequeue
        (async () => {
            try {
                for (;;) {
                    const { done, value } = await reader.read ();
                    if (done) {
                        break;
                    }
                    queue.push (value);
                    if (wake) {
                        const w = wake;
                        wake = null;
                        w ();
                    }
                }
            } catch (e) {
                // error propagation is handled via this.wss.closed
            }
            readerDone = true;
            if (wake) {
                const w = wake;
                wake = null;
                w ();
            }
        }) ();
        // paced delivery. Two modes:
        //  - default: one message per event-loop turn (exact ws
        //    allowSynchronousEvents:false semantics; this is the measured
        //    configuration in WS-PROFILE-FINDINGS.md)
        //  - adaptive ({ options: { adaptiveDeferral: true } }): yield a turn
        //    only when the dispatch actually RESOLVED a pending future (an
        //    awaiting consumer exists that must re-arm), or every
        //    FAIRNESS_BATCH messages to bound event-loop lag. Messages nobody
        //    awaits (cache updates, unsubscribed topics) flow at full speed.
        //    Consumers still get 100% of achievable wakeups: whenever their
        //    future was resolved, a full turn passes before the next message.
        const adaptive = !!(this.options && this.options['adaptiveDeferral']);
        const fairnessBatch = (this.options && this.options['fairnessBatch']) || 64;
        let batch = 0;
        for (;;) {
            if (head < queue.length) {
                const value = queue[head];
                queue[head] = undefined;
                head++;
                if ((head > 4096) && (head * 2 > queue.length)) {
                    queue.splice (0, head); // compact the consumed prefix
                    head = 0;
                }
                this.wakeupPending = false;
                this.onMessage ({ data: value });
                batch++;
                if (!adaptive || this.wakeupPending || (batch >= fairnessBatch)) {
                    batch = 0;
                    await new Promise ((resolve) => setImmediate (resolve));
                }
            } else if (readerDone) {
                break;
            } else {
                batch = 0;
                await new Promise ((resolve) => {
                    wake = resolve;
                });
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

    onMessage (messageEvent) {
        let message = messageEvent.data;
        if (typeof message !== 'string') {
            // opt. 1: zero-copy Buffer view (correct + fast utf8 toString)
            const buf = Buffer.from (message.buffer, message.byteOffset, message.byteLength);
            if (this.gunzip || this.inflate) {
                // rare path: identical to stock Client.onMessage (Buffer slices the same)
                super.onMessage ({ data: buf });
                return;
            }
            message = this.decompressBinary ? buf.toString () : buf;
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
