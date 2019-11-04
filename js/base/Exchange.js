"use strict";

const ccxt = require ('ccxt')
const WebSocketClient = require ('./WebSocketClient')

module.exports = class Exchange extends ccxt.Exchange {

    handleWsDropped (client, response, messageHash) {}

    handleWsMessage (client, response) {
        const messageHash = this.getWsMessageHash (client, response);
        if (!(messageHash in client.futures)) {
            this.handleWsDropped (client, response, messageHash);
            return;
        }
        let future = client.futures[messageHash];
        future.resolve (response);
    }

    defineWsApi (has) {
        let methods = Object.keys (has).filter (key => key.includes ('Ws'))
            .map (key => key.slice (key.indexOf ('Ws')))

        let _this = this
        for (let method of methods) {
            this[method + 'Message'] = async (url, messageHash, subscribe = undefined) => {
                let result = await WebSocketClient.registerFuture (url, messageHash, _this.handleWsMessage.bind (_this), _this.apiKey, subscribe)
                return _this['handle' + method] (result)
            }
        }
    }
}
