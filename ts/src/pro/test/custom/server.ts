// @ts-nocheck

import WebSocket, { WebSocketServer as WsServer } from 'ws'
import http from 'http'
import { extend } from '../../../base/functions.js'

// ----------------------------------------------------------------------------
// a sandbox ws server for testing and debugging

class WebSocketServer {

    constructor (config = {}) {

        const defaults = {
            "terminateTimeout": undefined, // terminate the connection immediately or later
            "closeTimeout": undefined, // close after a while
            "errorTimeout": undefined, // error after a while
            "closeCode": 1000, // default closing code 1000 = ok
            "handshakeDelay": undefined, // delay the handshake to simulate connection timeout
            "port": 8080,
            "onEcho": undefined, // callback (ws, message) invoked after each echoed message
            "onNewConnection": undefined, // callback (ws, connectionIndex) invoked when a connection is established
        }

        // merge to this
        const entries = Object.entries (extend (defaults, config))
        for (let i = 0; i < entries.length; i++) {
            const [ property, value ] = entries[i]
            this[property] = value
        }

        this.connections = [] // active sockets
        this.connectionCount = 0
        this.server = http.createServer ()
        this.wsServer = new WsServer ({ "noServer": true })
        this.wsServer.on ('connection', this.onConnection.bind (this))
        this.server.on ('upgrade', this.onUpgrade.bind (this))

        console.log (new Date (), 'listening port', this.port)
        this.server.listen (this.port)
    }

    onConnection (ws, request) {

        console.log (new Date (), 'onConnection')

        this.connections.push (ws)
        this.connectionCount++
        if (this.onNewConnection !== undefined) {
            this.onNewConnection (ws, this.connectionCount)
        }

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
        ws.on ('message', (message) => {
            console.log (new Date (), 'onMessage', message)
            if (message === 'error') {
                invalidFrame (ws)
            } else if (message === 'close') {
                ws.close (this.closeCode)
            } else {
                // echo back
                ws.send (message)
            }
            if (this.onEcho !== undefined) {
                this.onEcho (ws, message)
            }
        })
        ws.on ('ping', (message) => {
            console.log (new Date (), 'onPing', message.toString ())
            // ws.pong () // ws sends pong automatically
        })
        ws.on ('pong', (message) => {
            console.log (new Date (), 'onPong', message)
        })
        ws.on ('close', (code) => {
            console.log (new Date (), 'onClose', code)
        })
        // ws.ping ()
    }

    error (ws) {
        ws._sender._socket.write ('invalid frame')
    }

    send (message) {
        // send a frame to every open connection, used by the tests to emit scripted messages
        const frame = (typeof message === 'string') ? message : JSON.stringify (message)
        for (let i = 0; i < this.connections.length; i++) {
            const ws = this.connections[i]
            if (ws !== undefined && ws.readyState === WebSocket.OPEN) {
                ws.send (frame)
            }
        }
    }

    terminateAll () {
        // terminate every open connection with the close code 1006
        for (let i = 0; i < this.connections.length; i++) {
            const ws = this.connections[i]
            if (ws !== undefined) {
                ws.terminate ()
            }
        }
    }

    onUpgrade (request, socket, head) {
        console.log (new Date (), 'onUpgrade')
        if (Number.isInteger (this.handshakeDelay)) {
            console.log (new Date (), 'handshake delay', this.handshakeDelay)
            setTimeout (() => {
                this.wsServer.handleUpgrade (request, socket, head, ((ws) => {
                    this.wsServer.emit ('connection', ws, request)
                }))
            }, this.handshakeDelay)
        } else {
            this.wsServer.handleUpgrade (request, socket, head, ((ws) => {
                this.wsServer.emit ('connection', ws, request)
            }))
        }
    }
}

export default WebSocketServer
