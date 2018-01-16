"use strict";

/*  ------------------------------------------------------------------------ */

const { isNode } = require ('./platform')

/*  ------------------------------------------------------------------------ */

const time = isNode ? (require ('perf_hooks').performance) :                // a built-in high-resolution timer available in Node
                      (typeof performance !== 'undefined') ? performance    // ...it is also should be available in modern browsers
                                                           : Date           // (fall back to the default standard resolution timer)

/*  ------------------------------------------------------------------------ */

const setTimeout_safe = (done, ms, setTimeout = setTimeout_original /* overrideable for mocking purposes */, targetTime = time.now () + ms) => {

/*  The built-in setTimeout function can fire its callback earlier than specified, so we
    need to ensure that it does not happen: sleep recursively until `targetTime` is reached...   */

    let clearInnerTimeout = () => {}
    let active = true

    let id = setTimeout (() => {
        active = true
        const rest = targetTime - time.now ()
        if (rest > 0) {
            clearInnerTimeout = setTimeout_safe (done, rest, setTimeout, targetTime) // try sleep more
        } else {
            done ()
        }
    }, ms)

    return function clear () {
        if (active) {
            active = false // dunno if IDs are unique on various platforms, so it's better to rely on this flag to exclude the possible cancellation of the wrong timer (if called after completion)
            clearTimeout (id)
        }
        clearInnerTimeout ()
    }
}

/*  ------------------------------------------------------------------------ */

class TimedOut extends Error {

    constructor () {
        const message = 'timed out'
        super (message)
        this.constructor = Error
        this.__proto__   = Error.prototype
        this.message     = message
    }
}

/*  ------------------------------------------------------------------------ */

module.exports = {

    time,

    sleep: ms => new Promise (resolve => setTimeout_safe (resolve, ms)),

    TimedOut,

    async timeout (ms, promise) {

        let clear = () => {}
        const expires = new Promise (resolve => (clear = setTimeout_safe (resolve, ms)))
    
        try {
            return await Promise.race ([promise, expires.then (() => { throw new TimedOut () })])
        } finally {
            clear () // fixes https://github.com/ccxt/ccxt/issues/749
        }
    }
}

/*  ------------------------------------------------------------------------ */
