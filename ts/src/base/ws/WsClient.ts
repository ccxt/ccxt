// eslint-disable-next-line no-shadow
import WebSocket from 'ws';
import Client from './Client.js';

import {
    sleep,
    isNode,
    milliseconds,
    selfIsDefined,
} from '../../base/functions.js';
import { Future } from './Future.js';

// eslint-disable-next-line no-restricted-globals
const WebSocketPlatform = isNode || !selfIsDefined() ? WebSocket : self.WebSocket;

export default class WsClient extends Client {

    connectionStarted: number | undefined;

    protocols: any;

    options: any;

    startedConnecting: boolean = false;

    createConnection () {
        if (this.verbose) {
            this.log (new Date (), 'connecting to', this.url)
        }
        this.connectionStarted = milliseconds ()
        this.setConnectionTimeout ()
        if (isNode) {
            this.connection = new WebSocketPlatform (this.url, this.protocols, this.options)
        } else {
            this.connection = new WebSocketPlatform (this.url, this.protocols)
        }

        this.connection.onopen = this.onOpen.bind (this)
        this.connection.onmessage = this.onMessage.bind (this)
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

    connect () {
        if (!this.startedConnecting) {
            this.startedConnecting = true
            this.createConnection ()
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
            this.messagesThrottler.clear ();
            this.connectionsThrottler.clear ();
            this.connection.close ();
        }
        return this.disconnected;
    }

}
