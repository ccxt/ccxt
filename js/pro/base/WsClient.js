'use strict';

const functions = require ("../../base/functions.js")
    , {
        sleep,
        isNode,
        milliseconds,
    } = functions
    , Client = require ('./Client')
    // eslint-disable-next-line
    , WebSocket = isNode ? require ('ws') : self.WebSocket

module.exports = class WsClient extends Client {

    createConnection () {
        if (this.verbose) {
            this.log (new Date (), 'connecting to', this.url)
        }
        this.connectionStarted = milliseconds ()
        this.setConnectionTimeout ()
        if (isNode) {
            this.connection = new WebSocket (this.url, this.protocols, this.options)
        } else {
            this.connection = new WebSocket (this.url, this.protocols)
        }

        this.connection.onopen = this.onOpen.bind (this)
        this.connection.onmessage = this.onMessage.bind (this)
        this.connection.onerror = this.onError.bind (this)
        this.connection.onclose = this.onClose.bind (this)
        if (isNode) {
            this.connection
                .on ('ping', this.onPing.bind (this))
                .on ('pong', this.onPong.bind (this))
                .on ('upgrade', this.onUpgrade.bind (this))
        }
        // this.connection.terminate () // debugging
        // this.connection.close () // debugging
    }

    connect (backoffDelay = 0) {
        if (!this.startedConnecting) {
            this.startedConnecting = true
            // exponential backoff for consequent ws connections if necessary
            if (backoffDelay) {
                sleep (backoffDelay).then (this.createConnection.bind (this))
            } else {
                this.createConnection ()
            }
        }
        return this.connected
    }

    isOpen () {
        return (this.connection.readyState === WebSocket.OPEN)
    }

    close () {
        if (this.connection instanceof WebSocket) {
            return this.connection.close ()
        }
    }

}
