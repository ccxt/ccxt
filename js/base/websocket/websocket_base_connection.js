"use strict";

const EventEmitter = require('events')
const {
    NotSupported
} = require('../errors')

module.exports = class WebsocketBaseConnection extends EventEmitter {
    /*
    Events: 
        on('open')
        on('close')
        on('err', reason)
        on('message', data)
    */
    constructor () {
        super();
    }

    connect () {
        throw new NotSupported('not implemented method <connect>');
    }

    close () {
        throw new NotSupported('not implemented method <close>');
    }

    send(data) {
        throw new NotSupported('not implemented method <send>');
    }

    isActive() {
        throw new NotSupported('not implemented method <isActive>');
    }

    sendJson(data) {
        this.send (JSON.stringify(data));
    }
};