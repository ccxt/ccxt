'use strict'

const WebSocket = require ('ws')
    , http = require ('http')
    , { extend } = require ('ccxt')

// ----------------------------------------------------------------------------
// a sandbox ws server for testing and debugging

class WebSocketServer {

    constructor (config = {}) {

        const defaults = {
            terminateTimeout: undefined, // terminate the connection immediately or later
            closeTimeout: undefined, // close after a while
            errorTimeout: undefined, // error after a while
            closeCode: 1000, // default closing code 1000 = ok
            handshakeDelay: undefined, // delay the handshake to simulate connection timeout
            port: 8080,
        }

        // merge to this
        const entries = Object.entries (extend (defaults, config))
        for (let i = 0; i < entries.length; i++) {
            const [property, value] = entries[i]
            this[property] = value
        }

        this.server = http.createServer ()
        this.wss = new WebSocket.Server ({ noServer: true })
        this.wss.on ('connection', this.onConnection.bind (this))
        this.server.on ('upgrade', this.onUpgrade.bind (this))

        console.log (new Date (), 'listening port', this.port)
        this.server.listen (this.port)
    }

    onConnection (ws, request) {

        console.log (new Date (), 'onConnection')

        // terminate any incoming connection
        // immediately after it has been successfully established
        if (Number.isInteger (this.terminateTimeout)) {
            if (this.terminateTimeout) {
                setTimeout (() => { ws.terminate () }, this.terminateTimeout)
            } else {
                ws.terminate ()
            }
        }

        // close the connection after a certain amount of time
        if (Number.isInteger (this.closeTimeout)) {
            if (this.closeTimeout) {
                setTimeout (() => {
                    console.log (new Date (), 'Closing with code', this.closeCode, typeof this)
                    // ws.terminate ()
                    ws.close (this.closeCode)
                }, this.closeTimeout)
            } else {
                ws.close (this.closeCode)
            }
        }

        // error the connection after a certain amount of time
        if (Number.isInteger (this.errorTimeout)) {
            if (this.errorTimeout) {
                setTimeout (() => {
                    console.log (new Date (), 'Closing with code', this.errorTimeout, typeof this)
                    // ws.terminate ()
                    this.error (ws)
                }, this.errorTimeout)
            } else {
                this.error (ws)
            }
        }

        // ws.send ('something')

        // other stuff that might be useful
        ws.on ('message', function incoming (message) {
            console.log (new Date (), 'onMessage', message)
            if (message === 'error') {
                invalidFrame (ws)
            } else if (message === 'close') {
                ws.close (this.closeCode)
            } else {
                // echo back
                ws.send (message)
            }
        })
        ws.on ('ping', function incoming (message) {
            console.log (new Date (), 'onPing', message.toString ())
            // ws.pong () // ws sends pong automatically
        })
        ws.on ('pong', function incoming (message) {
            console.log (new Date (), 'onPong', message)
        })
        ws.on ('close', function incoming (code) {
            console.log (new Date (), 'onClose', code)
        })
        // ws.ping ()
    }

    error (ws) {
        ws._sender._socket.write ('invalid frame')
    }

    onUpgrade (request, socket, head) {
        console.log (new Date (), 'onUpgrade')
        if (Number.isInteger (this.handshakeDelay)) {
            console.log (new Date (), 'handshake delay', this.handshakeDelay)
            setTimeout (() => {
                this.wss.handleUpgrade (request, socket, head, (function done (ws) {
                    this.wss.emit ('connection', ws, request)
                }).bind (this))
            }, this.handshakeDelay)
        } else {
            this.wss.handleUpgrade (request, socket, head, (function done (ws) {
                this.wss.emit ('connection', ws, request)
            }).bind (this))
        }
    }
}

module.exports = WebSocketServer

// ----------------------------------------------------------------------------
// if launched in console instead of being required as a module

if (require.main === module) {
    (async () => { const wss = new WebSocketServer () }) ()
}
