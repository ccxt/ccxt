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

        // ws.send ('something')
        let i = 0
        const blaster = setInterval (() => {
            console.log ('sending ' + i)
            ws.send (i++)
        }, 1)
        // sleep in the php code to see the lag

        // other stuff that might be useful
        ws.on ('message', function incoming (message) {
            console.log (new Date (), 'onMessage', message)
            // ws.send (message) // echo back
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
            clearInterval (blaster)
        })
        // ws.ping ()
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
