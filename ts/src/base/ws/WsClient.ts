// eslint-disable-next-line no-shadow
import WebSocket, { createWebSocketStream } from 'ws';
import Client from './Client.js';

import {
    sleep,
    isNode,
    milliseconds,
    selfIsDefined,
} from '../../base/functions.js';
import { Future } from './Future.js';

// eslint-disable-next-line no-restricted-globals
const WebSocketPlatform = isNode || !selfIsDefined () ? WebSocket : self.WebSocket;

export default class WsClient extends Client {

    connectionStarted: number | undefined;

    protocols: any;

    options: any;

    duplex: any;

    startedConnecting: boolean = false;

    createConnection () {
        if (this.verbose) {
            this.log (new Date (), 'connecting to', this.url)
        }
        this.connectionStarted = milliseconds ()
        this.setConnectionTimeout ()

        const connectionHeaders = {};
        if (this.cookies !== undefined) {
            let cookieStr = '';
            const cookiesKeys = Object.keys (this.cookies);
            for (let i = 0; i < cookiesKeys.length; i++) {
                const key = cookiesKeys[i];
                const value = this.cookies[key];
                cookieStr += key + '=' + value;
                if (i < cookiesKeys.length - 1) {
                    cookieStr += '; ';
                }
            }
            connectionHeaders['Cookie'] = cookieStr;
            this.options['headers'] = Object.assign (this.options['headers'] || {}, connectionHeaders);
        }
        if (isNode) {
            this.options = this.options || {};
            this.connection = new WebSocketPlatform (this.url, this.protocols, this.options);
            // message delivery goes through a duplex stream wrapper instead of
            // per-message deferred events (the old allowSynchronousEvents:false
            // patch): ws emits all messages of a socket chunk synchronously on
            // one stack; the stream parks them in its internal buffer (O(1)
            // push) and the async iterator in deliverLoop delivers exactly one
            // message per step on a fresh stack, so consumer code never runs
            // inside ws's emission stack. readableObjectMode keeps
            // 1 chunk = 1 message (byte mode would fuse frames once anything
            // buffers); readableHighWaterMark (counted in messages) is a
            // memory circuit breaker: past it the socket is paused (TCP
            // backpressure to the server) until reads drain. the duplex must
            // be attached synchronously with the socket - messages emitted
            // between 'open' and a later attachment would be dropped silently
            this.duplex = createWebSocketStream (this.connection, { 'readableObjectMode': true, 'readableHighWaterMark': 1024 });
            this.duplex.on ('error', () => {}); // teardown surfaces via the socket error/close handlers
        } else {
            this.connection = new WebSocketPlatform (this.url, this.protocols)
            this.connection.binaryType = "arraybuffer"; // for browsers not to use blob by default
        }

        this.connection.onopen = this.onConnectionOpen.bind (this)
        if (!isNode) {
            // browsers deliver through native WebSocket events; on node the
            // duplex deliverLoop above owns message delivery
            this.connection.onmessage = this.onMessage.bind (this)
        }
        this.connection.onerror = this.onError.bind (this)
        this.connection.onclose = this.onClose.bind (this)
        if (isNode) {
            this.connection
                .on ('ping', this.onPing.bind (this))
                .on ('pong', this.onPong.bind (this))
                .on ('upgrade', this.onUpgrade.bind (this))
        }
        // this.connection.terminate () // debugging
        // this.connection.close () // debugging
    }

    onConnectionOpen () {
        if (isNode) {
            this.deliverLoop ();
        }
        this.onOpen ();
    }

    // one message per async-iterator step, plus one explicit microtask hop
    // between deliveries: the hop lets a consumer awaiting a just-resolved
    // future run its re-arm microtask chain ahead of the next delivery
    // (restores full burst wakeups for shallow re-arm chains at ~zero cost)
    async deliverLoop () {
        // discriminates errors escaping onMessage from iterator rejections
        // caused by socket teardown (which are already handled by the
        // error/close handlers above). connection state cannot be used for
        // this: when the loop body throws, for-await first runs the implicit
        // iterator.return (), which destroys the duplex and starts closing
        // the socket before the catch executes
        let dispatching = false;
        try {
            for await (const message of this.duplex) {
                dispatching = true;
                this.onMessage ({ 'data': message });
                // release valve: when the server sends faster than the paced
                // delivery below drains, messages pile up inside the duplex
                // buffer - flush them synchronously through onMessage, the
                // same way the php client flushes its backlog in on_message
                // (php/pro/Client.php) and the python client drains the
                // aiohttp buffer in receive_loop (async_support/base/ws/
                // client.py). this keeps queueing latency and memory bounded
                // under bursts at the cost of per-message consumer wakeups
                // (consumers awaiting futures observe the merged/cached
                // state on their next wakeup - identical cross-language
                // semantics); the microtask hop below then only paces
                // delivery while the client is keeping up
                while (this.duplex.readableLength > 0) {
                    const queued = this.duplex.read ();
                    if (queued === null) {
                        break;
                    }
                    this.onMessage ({ 'data': queued });
                }
                dispatching = false;
                await Promise.resolve ();
            }
        } catch (e) {
            if (dispatching) {
                // an error escaped onMessage - apply the established WsClient
                // error semantics: onError (normalize to NetworkError, set
                // this.error so the follow-up onClose does not clobber it,
                // reset, reject all pending futures), then close the
                // connection
                this.onError (e);
                this.close ();
            }
        }
    }

    connect (backoffDelay = 0) {
        if (!this.startedConnecting) {
            this.startedConnecting = true
            // exponential backoff for consequent ws connections if necessary
            if (backoffDelay) {
                sleep (backoffDelay).then (this.createConnection.bind (this))
            } else {
                this.createConnection ()
            }
        }
        return this.connected
    }

    isOpen () {
        return (this.connection.readyState === WebSocketPlatform.OPEN)
    }

    close () {
        if (this.connection instanceof WebSocketPlatform) {
            if (this.disconnected === undefined) {
                this.disconnected = Future ();
            }
            this.connection.close ();
        }
        return this.disconnected;
    }

}
