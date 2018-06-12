"use strict";

module.exports = class AsyncSymbolContext {
    constructor(conxid){
        this.subscribed = false;
        this.subscribing = false;
        this.data = null;
        this.conxid = conxid;
    }

    reset() {
        this.subscribed = false;
        this.data = null;
    }
}