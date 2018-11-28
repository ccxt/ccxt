"use strict";

const WebsocketBaseConnection = require ('./websocket_base_connection');
const WebSocket = require('ws');

const { sleep } = require ('../functions')

module.exports = class WebsocketConnection extends WebsocketBaseConnection {
    constructor (options, timeout) {
        super();
        this.options = options;
        this.timeout = timeout;
        this.client = {
            ws: null,
            isClosing: false,
        };
    }

    connect() {
        return new Promise ((resolve, reject) => {
            if ((this.client.ws != null) && (this.client.ws.readyState === this.client.ws.OPEN)) {
                resolve();
                return;
            }
            const client = {
                ws: null,
                isClosing: false,
            };
            if (this.options.agent) {
                client.ws = new WebSocket(this.options.url, { agent: this.options.agent });
            } else {
                client.ws = new WebSocket(this.options.url);
            }

            client.ws.on('open', async () => {
                if (this.options['wait-after-connect']) {
                    await sleep(this.options['wait-after-connect']);
                }
                this.emit ('open');
                resolve();
            });

            client.ws.on('error', (error) => {
                if (!client.isClosing) {
                    this.emit('err', error);
                }
                reject(error);
            });
        
            client.ws.on('close', () => {
                if (!client.isClosing) {
                    this.emit('close');
                }
                reject('closing');
            });
        
            client.ws.on('message', async (data) => {
                if (this.options['verbose']){
                    console.log("WebsocketConnection: "+data);
                }

                if (!client.isClosing) {
                    this.emit('message', data);
                }
                resolve();
            });
            this.client = client;
        });
    }

    close () {
        if (this.client.ws != null) {
            this.client.isClosing = true;
            this.client.ws.close();
            this.client.ws = null;
        }
    }

    send (data) {
        if (!this.client.isClosing) {
            this.client.ws.send (data);
        }
    }

    isActive() {
        if (this.client.ws == null){
            return false;
        }
        return (this.client.ws.readyState == this.client.ws.OPEN) || 
            (this.client.ws.readyState == this.client.ws.CONNECTING);
    }
};