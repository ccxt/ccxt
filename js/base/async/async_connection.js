"use strict";

const EventEmitter = require('events')
const {
    NotSupported
} = require('../errors')

module.exports = class AsyncConnection extends EventEmitter {
    /*
    Events: 
        on('close')
        on('error', reason)
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

    sendJson(data) {
        this.send (JSON.stringify(data));
    }
};