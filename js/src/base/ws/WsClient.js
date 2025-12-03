// eslint-disable-next-line no-shadow
import WebSocket from 'ws';
import Client from './Client.js';
import { sleep, isNode, milliseconds, selfIsDefined, } from '../../base/functions.js';
import { Future } from './Future.js';
// eslint-disable-next-line no-restricted-globals
const WebSocketPlatform = isNode || !selfIsDefined() ? WebSocket : self.WebSocket;
export default class WsClient extends Client {
    constructor() {
        super(...arguments);
        this.startedConnecting = false;
    }
    createConnection() {
        if (this.verbose) {
            this.log(new Date(), 'connecting to', this.url);
        }
        this.connectionStarted = milliseconds();
        this.setConnectionTimeout();
        const connectionHeaders = {};
        if (this.cookies !== undefined) {
            let cookieStr = '';
            const cookiesKeys = Object.keys(this.cookies);
            for (let i = 0; i < cookiesKeys.length; i++) {
                const key = cookiesKeys[i];
                const value = this.cookies[key];
                cookieStr += key + '=' + value;
                if (i < cookiesKeys.length - 1) {
                    cookieStr += '; ';
                }
            }
            connectionHeaders['Cookie'] = cookieStr;
            this.options['headers'] = Object.assign(this.options['headers'] || {}, connectionHeaders);
        }
        if (isNode) {
            this.connection = new WebSocketPlatform(this.url, this.protocols, this.options);
        }
        else {
            this.connection = new WebSocketPlatform(this.url, this.protocols);
        }
        this.connection.onopen = this.onOpen.bind(this);
        this.connection.onmessage = this.onMessage.bind(this);
        this.connection.onerror = this.onError.bind(this);
        this.connection.onclose = this.onClose.bind(this);
        if (isNode) {
            this.connection
                .on('ping', this.onPing.bind(this))
                .on('pong', this.onPong.bind(this))
                .on('upgrade', this.onUpgrade.bind(this));
        }
        // this.connection.terminate () // debugging
        // this.connection.close () // debugging
    }
    connect(backoffDelay = 0) {
        if (!this.startedConnecting) {
            this.startedConnecting = true;
            // exponential backoff for consequent ws connections if necessary
            if (backoffDelay) {
                sleep(backoffDelay).then(this.createConnection.bind(this));
            }
            else {
                this.createConnection();
            }
        }
        return this.connected;
    }
    isOpen() {
        return (this.connection.readyState === WebSocketPlatform.OPEN);
    }
    close() {
        if (this.connection instanceof WebSocketPlatform) {
            if (this.disconnected === undefined) {
                this.disconnected = Future();
            }
            this.connection.close();
        }
        return this.disconnected;
    }
}
