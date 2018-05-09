"use strict";

const AsyncConnection = require ('./async_connection');
const WebSocket = require('ws');

module.exports = class WebsocketConnection extends AsyncConnection {
    constructor (config, timeout) {
        super();
        this.config = config;
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

            client.ws = new WebSocket(this.config.url);

            client.ws.on('open', () => {
                resolve();
            });

            client.ws.on('error', (error) => {
                if (!client.isClosing) {
                    this.emit('error', error);
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
            this.client = null;
        }
    }

    send (data) { 
        if (!this.client.isClosing) {
            this.client.ws.send (data);
        }
    }
};