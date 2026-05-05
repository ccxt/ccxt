// @ts-nocheck
import WebSocket from 'ws';
import http from 'http';
import { extend } from '../../../base/functions';
// ----------------------------------------------------------------------------
// a sandbox ws server for testing and debugging
class WebSocketServer {
    constructor(config = {}) {
        const defaults = {
            "terminateTimeout": undefined,
            "closeTimeout": undefined,
            "closeCode": 1000,
            "handshakeDelay": undefined,
            "port": 8080,
        };
        // merge to this
        const entries = Object.entries(extend(defaults, config));
        for (let i = 0; i < entries.length; i++) {
            const [property, value] = entries[i];
            this[property] = value;
        }
        this.server = http.createServer();
        thiss = new WebSocket.Server({ "noServer": true });
        thiss.on('connection', this.onConnection.bind(this));
        this.server.on('upgrade', this.onUpgrade.bind(this));
        console.log(new Date(), 'listening port', this.port);
        this.server.listen(this.port);
    }
    onConnection(ws, request) {
        console.log(new Date(), 'onConnection');
        // terminate any incoming connection
        // immediately after it has been successfully established
        if (Number.isInteger(this.terminateTimeout)) {
            if (this.terminateTimeout) {
                setTimeout(() => { ws.terminate(); }, this.terminateTimeout);
            }
            else {
                ws.terminate();
            }
        }
        // close the connection after a certain amount of time
        if (Number.isInteger(this.closeTimeout)) {
            if (this.closeTimeout) {
                setTimeout(() => {
                    console.log(new Date(), 'Closing with code', this.closeCode, typeof this);
                    // ws.terminate ()
                    ws.close(this.closeCode);
                }, this.closeTimeout);
            }
            else {
                ws.close(this.closeCode);
            }
        }
        // ws.send ('something')
        let i = 0;
        const blaster = setInterval(() => {
            console.log('sending ' + i);
            ws.send(i++);
        }, 1);
        // sleep in the php code to see the lag
        // other stuff that might be useful
        ws.on('message', (message) => {
            console.log(new Date(), 'onMessage', message);
            // ws.send (message) // echo back
        });
        ws.on('ping', (message) => {
            console.log(new Date(), 'onPing', message.toString());
            // ws.pong () // ws sends pong automatically
        });
        ws.on('pong', (message) => {
            console.log(new Date(), 'onPong', message);
        });
        ws.on('close', (code) => {
            console.log(new Date(), 'onClose', code);
            clearInterval(blaster);
        });
        // ws.ping ()
    }
    onUpgrade(request, socket, head) {
        console.log(new Date(), 'onUpgrade');
        if (Number.isInteger(this.handshakeDelay)) {
            console.log(new Date(), 'handshake delay', this.handshakeDelay);
            setTimeout(() => {
                thiss.handleUpgrade(request, socket, head, ((ws) => {
                    thiss.emit('connection', ws, request);
                }));
            }, this.handshakeDelay);
        }
        else {
            thiss.handleUpgrade(request, socket, head, ((ws) => {
                thiss.emit('connection', ws, request);
            }));
        }
    }
}
export default WebSocketServer;
// ----------------------------------------------------------------------------
// if launched in console instead of being required as a module
if (require.main === module) {
    (async () => { const wss = new WebSocketServer(); })();
}
