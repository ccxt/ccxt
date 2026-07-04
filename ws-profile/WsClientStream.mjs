// WsClientStream — ccxt's WsClient refactored onto undici's WebSocketStream.
// DIAGNOSTIC PROTOTYPE ONLY, lives in ws-profile/ so ccxt transport code stays
// untouched. It extends the BUILT ccxt Client (js/src/base/ws/Client.js), so
// the entire upper layer (futures, resolve/reject, onMessage JSON handling,
// keepAlive timers, connection timeout) is byte-identical to production; only
// the transport underneath is swapped, mirroring what a real refactor of
// ts/src/base/ws/WsClient.ts would do.
//
// Differences forced by the WebSocketStream API (documented in findings):
// - no protocol ping()/pong events: onPingInterval's node branch calls
//   this.connection.ping(); the facade below emulates the BROWSER branch of
//   Client.onPingInterval (assume liveness, refresh lastPong) because the API
//   gives no alternative.
// - send-completion comes from writer.write()'s promise instead of ws's
//   send callback (semantically equivalent: resolves after the frame is
//   accepted/written, rejects on a broken pipe).
// - CRASH HAZARD (undici 7.27.2): holding a WritableStream writer lock when
//   the connection closes UNCLEANLY crashes the whole process — undici's
//   #onSocketClose unclean path calls `this.#writableStream?.abort(error)`
//   without the `if (!locked)` guard the clean path has
//   (lib/web/websocket/stream/websocketstream.js:411), and
//   WritableStream.abort() throws synchronously when locked, inside a socket
//   'close' event handler => uncaughtException. Workaround used here: never
//   hold the lock — acquire writer, write, releaseLock() synchronously (the
//   pending write still settles per WHATWG streams semantics). This costs one
//   writer acquire/release per send.
// - connectionTimeout close(1006): WebSocketStream.close() only accepts 1000
//   or 3000-4999, so the facade close() drops invalid codes.
// - no `upgrade` event, no custom headers, no agent/dispatcher (options are
//   silently ignored by undici 7.27.2 — probed in probe-behavior.mjs).
import { WebSocketStream } from 'undici';
import Client from '../js/src/base/ws/Client.js';
import { Future } from '../js/src/base/ws/Future.js';

export default class WsClientStream extends Client {

    createConnection () {
        if (this.verbose) {
            this.log (new Date (), 'connecting to', this.url);
        }
        this.connectionStarted = Date.now ();
        this.setConnectionTimeout ();
        const opts = {};
        if (this.protocols) {
            opts.protocols = Array.isArray (this.protocols) ? this.protocols : [ this.protocols ];
        }
        this.wss = new WebSocketStream (this.url, opts);
        this.streamOpen = false;
        // facade so base-class Client code paths don't crash:
        // - Client.onConnectionTimeout calls this.connection.close(1006)
        // - Client.onPingInterval calls this.connection.ping() when isNode
        this.connection = {
            ping: () => {
                // WebSocketStream exposes no protocol-ping API; emulate the
                // browser branch of Client.onPingInterval (refresh lastPong)
                this.lastPong = Date.now ();
            },
            close: () => {
                try {
                    this.wss.close ({ closeCode: 1000 });
                } catch (e) {
                    try { this.wss.close (); } catch (e2) { /* already closed */ }
                }
            },
        };
        this.wss.opened.then (({ readable, writable }) => {
            this.streamOpen = true;
            this.writable = writable;
            this.readLoop (readable);
            this.onOpen ();
        }).catch ((e) => {
            this.onError (e);
        });
        this.wss.closed.then ((info) => {
            this.streamOpen = false;
            this.onClose ({ code: (info && info.closeCode) || 1000, reason: (info && info.reason) || '' });
        }).catch ((e) => {
            this.streamOpen = false;
            if (!this.error) {
                this.onError (e);
            }
            this.onClose ({ code: 1006, reason: '' });
        });
    }

    async readLoop (readable) {
        const reader = readable.getReader ();
        try {
            for (;;) {
                const { done, value } = await reader.read ();
                if (done) {
                    break;
                }
                // Client.onMessage expects a MessageEvent-shaped object;
                // text frames arrive as string, binary as Uint8Array
                this.onMessage ({ data: value });
            }
        } catch (e) {
            // error propagation is handled via this.wss.closed above
        }
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

    // acquire -> write -> releaseLock synchronously: the pending write still
    // settles (WHATWG streams), and leaving the stream unlocked avoids the
    // undici crash on unclean close (see header comment)
    writeFrame (data) {
        const writer = this.writable.getWriter ();
        const written = writer.write (data);
        writer.releaseLock ();
        return written;
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

    close () {
        if (this.disconnected === undefined) {
            this.disconnected = Future ();
        }
        try {
            this.wss.close ({ closeCode: 1000 });
        } catch (e) {
            try { this.wss.close (); } catch (e2) { /* already closed */ }
        }
        return this.disconnected;
    }

}
