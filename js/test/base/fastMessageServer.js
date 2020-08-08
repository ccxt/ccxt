'use strict'

const WebSocket = require ('ws')
    , http = require ('http')
    , { extend } = require ('ccxt')

// ----------------------------------------------------------------------------
// a sandbox ws server for testing and debugging

class WebSocketServer {

    constructor (config = {}) {

        const defaults = {
            terminateTimeout: 1000, // terminate the connection immediately or later
            closeTimeout: 500, // close after a while
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

        // exhibit a different behaviour on each connection
        this.connectionIndex = -1
        this.connections = ['terminateTest', 'terminateTest with timeout', 'closeTest', 'closeTest with timeout'];
        this.message = 0
        this.server = http.createServer ()
        this.wss = new WebSocket.Server ({ noServer: true })
        this.wss.on ('connection', this.onConnection.bind (this))
        this.server.on ('upgrade', this.onUpgrade.bind (this))
    }

    run () {
        console.log (new Date (), 'listening port', this.port)
        this.server.listen (this.port)
    }

    onConnection (ws, request) {

        console.log (new Date (), 'onConnection')

        // terminate any incoming connection
        // immediately after it has been successfully established
        this.connectionIndex++
        if (this.connectionIndex < this.connections.length) {
            console.log (new Date (), this.connections[this.connectionIndex])
        } else {
            process.exit (0)
        }
        const blaster = setInterval (() => {
            ws.send (this.connections[this.connectionIndex] + ' ' + this.message++)
        }, 10)
        switch (this.connectionIndex) {
            case 0:
                ws.terminate ()
                clearInterval (blaster)
                break
            case 1:
                setTimeout (() => { ws.terminate (); clearInterval (blaster) }, this.terminateTimeout)
                break
            case 2:
                ws.close (this.closeCode)
                clearInterval (blaster)
                break
            case 3:
                let interval = undefined
                interval = setTimeout (() => {
                    console.log (new Date (), 'Closing with code', this.closeCode, typeof this)
                    // ws.terminate ()
                    ws.close (this.closeCode)
                    clearInterval (interval)
                    clearInterval (blaster)
                }, this.closeTimeout)
                break
        }

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
    (async () => { const wss = new WebSocketServer (); wss.run () }) ()
}
