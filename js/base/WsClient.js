'use strict';

const ccxt = require ('ccxt')
    , {
        sleep,
        isNode,
        milliseconds,
    } = ccxt
    , Client = require ('./Client')
    , WebSocket = isNode ? require ('ws') : window.WebSocket

module.exports = class WsClient extends Client {

    createConnection () {
        console.log (new Date (), 'connecting to', this.url)
        this.connectionStarted = milliseconds ()
        this.setConnectionTimeout ()
        this.connection = new WebSocket (this.url, this.protocols, this.options)
        this.connection
            .on ('open', this.onOpen.bind (this))
            .on ('ping', this.onPing.bind (this))
            .on ('pong', this.onPong.bind (this))
            .on ('error', this.onError.bind (this))
            .on ('close', this.onClose.bind (this))
            .on ('upgrade', this.onUpgrade.bind (this))
            .on ('message', this.onMessage.bind (this))
        // this.connection.terminate () // debugging
        // this.connection.close () // debugging
    }

    connect (backoffDelay = 0) {
        if ((this.connection.readyState !== WebSocket.OPEN) && (this.connection.readyState !== WebSocket.CONNECTING)) {
            // prevent multiple calls overwriting each other
            this.connection.readyState = WebSocket.CONNECTING
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
}
