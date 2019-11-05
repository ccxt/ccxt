'use strict'

module.exports = function Deferred () {
    let resolve, reject, bogusTimeout

    function makePromise () {
        return new Promise ((resolve_, reject_) => {
            resolve = resolve_
            reject = reject_
            // prevents unwanted process termination when no more event loop tasks left
            bogusTimeout = setTimeout (() => {}, 1000000000)
        })
    }

    const d = Object ()
    const promise = makePromise ()
    d.promise = function () { return promise }
    d.resolve = function (result) {
        clearTimeout (bogusTimeout)
        resolve.apply (promise, arguments)
    }
    d.reject = function (error) {
        clearTimeout (bogusTimeout)
        reject.apply (promise, arguments)
    }
    return d
}
