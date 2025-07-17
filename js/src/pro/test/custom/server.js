// @ts-nocheck
import WebSocket from 'ws';
import http from 'http';
import { extend } from 'ccxt';
// ----------------------------------------------------------------------------
// a sandbox ws server for testing and debugging
class WebSocketServer {
    constructor(config = {}) {
        const defaults = {
            "terminateTimeout": undefined,
            "closeTimeout": undefined,
            "errorTimeout": undefined,
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
        // error the connection after a certain amount of time
        if (Number.isInteger(this.errorTimeout)) {
            if (this.errorTimeout) {
                setTimeout(() => {
                    console.log(new Date(), 'Closing with code', this.errorTimeout, typeof this);
                    // ws.terminate ()
                    this.error(ws);
                }, this.errorTimeout);
            }
            else {
                this.error(ws);
            }
        }
        // ws.send ('something')
        // other stuff that might be useful
        ws.on('message', function incoming(message) {
            console.log(new Date(), 'onMessage', message);
            if (message === 'error') {
                invalidFrame(ws);
            }
            else if (message === 'close') {
                ws.close(this.closeCode);
            }
            else {
                // echo back
                ws.send(message);
            }
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
        });
        // ws.ping ()
    }
    error(ws) {
        ws._sender._socket.write('invalid frame');
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
