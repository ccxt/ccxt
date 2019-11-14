'use strict'

function externallyResolvablePromise () {

    let resolve = undefined
        , reject = undefined

    const p = new Promise ((resolve_, reject_) => {
        resolve = resolve_
        reject = reject_
    })

    p.resolve = function _resolve () {
        resolve.apply (this, arguments)
    }

    p.reject = function _reject () {
        reject.apply (this, arguments)
    }

    return p
}

class ExternallyResolvablePromise {

    constructor () {
        this.resolve_ = undefined
        this.reject_ = undefined
        this.bogusTimeout = undefined
        this.reset ()
    }

    reset () {
        this.value = new Promise ((resolve, reject) => {
            // prevents termination when no more event loop tasks left
            // this.bogusTimeout = setTimeout (() => {}, 1000000000)
            this.resolve_ = resolve
            this.reject_ = reject
        })
        return this
    }

    resolve () {
        // clearTimeout (this.bogusTimeout)
        this.resolve_.apply (this, arguments)
        return this
    }

    reject () {
        // clearTimeout (this.bogusTimeout)
        this.reject_.apply (this, arguments)
        return this
    }

}

class MultiPromise extends ExternallyResolvablePromise {

    resolve () {
        return super.resolve.apply (this, arguments).reset ()
    }

    reject () {
        return super.reject.apply (this, arguments).reset ()
    }
}

module.exports = {
    MultiPromise,
    ExternallyResolvablePromise,
    externallyResolvablePromise,
}
