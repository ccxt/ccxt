"use strict";


function wrap (object) {
    for (const name of Object.getOwnPropertyNames (this.constructor.prototype)) {
        if (isMethod (name)) {
            const impl = this[name].bind (this)
            this[name] = async (...args) => { // generates a wrapper around CCXT method
                ...
            }
        }
    }
}


module.exports = {
    'exports':
}