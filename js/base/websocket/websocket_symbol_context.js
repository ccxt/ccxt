"use strict";

module.exports = class AsyncSymbolContext {
    constructor(conxid){
        this.subscribed = false;
        this.subscribing = false;
        this.data = {};
        this.conxid = conxid;
    }

    reset() {
        this.subscribed = false;
        this.subscribing = false;
        this.data = {};
    }
}