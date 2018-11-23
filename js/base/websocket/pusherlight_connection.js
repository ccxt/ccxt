"use strict";

const WebsocketBaseConnection = require ('./websocket_base_connection');
const WebSocket = require('ws');

const { sleep } = require ('../functions')

const CLIENT = 'ccxt-light-client';
const VERSION = '1.0';
const PROTOCOL = '7';

module.exports = class PusherLightConnection extends WebsocketBaseConnection {
    constructor (options, timeout) {
        super();
        this.options = options;
        this.timeout = timeout;
        this.client = {
            ws: null,
            isClosing: false,
            activityTimeout: 120 * 1000,
            pongTimeout: 30 * 1000
        };
        this._activityTimer = undefined;
        this.urlParam = `?client=${CLIENT}&version=${VERSION}&protocol=${PROTOCOL}`;
    }

    resetActivityCheck() {
        if (this._activityTimer) {
            clearTimeout(this._activityTimer);
        }
        if (this.client.isClosing) {
            return;
        }
        var that = this;
        // Send ping after inactivity
        this._activityTimer = setTimeout(function() {
            if (!that.client.isClosing){
                that.client.ws.send(JSON.stringify({
                    event: 'pusher:ping',
                    data : {}
                }));
                // Wait for pong response
                _activityTimer = setTimeout(function() {
                    if (!that.client.isClosing){
                        that.client.ws.close();
                    }
                }, that.client.pongTimeout)
            }
        }, that.client.activityTimeout);
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
                activityTimeout: 120 * 1000,
                pongTimeout: 30 * 1000
            };
            if (this.options.agent) {
                client.ws = new WebSocket(this.options.url + this.urlParam, { agent: this.options.agent });
            } else {
                client.ws = new WebSocket(this.options.url + this.urlParam);
            }

            client.ws.on('open', async () => {
                
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
                // console.log(data);
                if (client.isClosing) {
                    return;
                }
                this.resetActivityCheck ();
                const msg = JSON.parse(data);
                if (msg.event === 'pusher:connection_established'){
                    // starting
                    const eventData = JSON.parse(msg.data);
                    if (eventData.activity_timeout){
                        this.client.activityTimeout = eventData.activity_timeout * 1000;
                    }
                    if (this.options['wait-after-connect']) {
                        await sleep(this.options['wait-after-connect']);
                    }
                    this.emit ('open');
                    resolve();
                } else if (msg.event === 'pusher:ping'){
                    ws.send(JSON.stringify({
                        event: 'pusher:pong',
                        data: {}
                    }));
                } else if (msg.event === 'data'){
                    const eventData = JSON.parse(msg.data);
                    const channel = msg.channel;
                    this.emit('message', JSON.stringify({
                        event: 'data',
                        channel,
                        data: eventData
                    }));
                } else if (msg.event === 'pusher_internal:subscription_succeeded'){
                    const channel = msg.channel;
                    this.emit('message', JSON.stringify({
                        event: 'subscription_succeeded',
                        channel
                    }));
                } else if (msg.event === 'pusher:error'){
                    // {"event":"pusher:error","data":{"code":null,"message":"Unsupported event received on socket: subscribe"}
                    this.emit ('err', msg.data.message);
                } else {
                    console.log(msg);
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
            var jsonData = JSON.parse(data);
            if (jsonData.event === 'subscribe'){
                this.client.ws.send (JSON.stringify({
                    event: 'pusher:subscribe',
                    data: {
                        channel: jsonData.channel
                    }
                }));
            } else if (jsonData.event === 'unsubscribe'){
                this.client.ws.send (JSON.stringify({
                    event: 'pusher:unsubscribe',
                    data: {
                        channel: jsonData.channel
                    }
                }));
            }
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