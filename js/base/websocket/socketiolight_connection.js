"use strict";

const WebsocketBaseConnection = require ('./websocket_base_connection');
const WebSocket = require('ws');

const { sleep } = require ('../functions')

module.exports = class SocketIoLightConnection extends WebsocketBaseConnection {
    constructor (options, timeout) {
        super();
        this.options = options;
        this.timeout = timeout;
        this.client = {
            ws: null,
            isClosing: false,
            pingIntervalMs: 25000,
            pingTimeoutMs: 5000
        };
        this.pingInterval = null;
        this.pingTimeout = null;
    }
    createPingProcess (){
        var that = this;
        this.destroyPingProcess();
        this.pingInterval = setInterval(function(){
            if (that.client.isClosing) {
                that.destroyPingProcess();
            } else {
                that.cancelPingTimeout();
                that.client.ws.send('2');
                if (this.options['verbose']){
                    console.log("SocketioLightConnection: ping sent");
                }

                that.pingTimeout = setTimeout(function(){
                    that.emit('err', 'pong not received from server');
                    that.close();
                }, that.client.pingTimeoutMs);
            }
        }, this.client.pingIntervalMs);
    }

    destroyPingProcess() {
        if (this.pingInterval != null){
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
        this.cancelPingTimeout();
    }
    cancelPingTimeout() {
        if (this.pingTimeout != null){
            clearTimeout(this.pingTimeout);
            this.pingTimeout = null;
        }
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
                pingIntervalMs: 25000,
                pingTimeoutMs: 5000
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
                this.close();
                reject('closing');
            });
        
            client.ws.on('message', async (data) => {
                if (this.options['verbose']){
                    console.log("SocketioLightConnection: "- data);
                }

                if (!client.isClosing) {
                    if (data[0] === '0') {
                        // initial message
                        const msg = JSON.parse(data.slice(1));
                        this.client.pingIntervalMs = msg.pingInterval;
                        this.client.pingTimeoutMs = msg.pingTimeout;
                        
                    } else if (data[0] == '3') {
                        this.cancelPingTimeout();
                        if (this.options['verbose']){
                            console.log("SocketioLightConnection: pong received");
                        }
                    } else if (data[0] == '4') {
                        if (data[1] == '2') {
                            this.emit('message', data.slice(2));
                        } else if (data[1] == '0'){
                            this.createPingProcess();
                            this.emit ('open');
                            resolve();
                        }
                    } else if (data[0] == '1'){
                        // disconnect
                        this.emit ('err', 'server sent disconnect message');
                        this.close();
                    } else {
                        console.log("unknown msg received from iosocket: ", data);
                    }
                }
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
            this.client.ws.send ('42'+data);
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