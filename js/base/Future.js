'use strict'

module.exports = function Deferred () {
    let resolve, reject, bogusTimeout

    function makePromise () {
        return new Promise((resolve_, reject_) => {
            resolve = resolve_
            reject = reject_
            bogusTimeout = setTimeout(function () {}, 1000000000) // prevents unwanted process termination when no more event loop tasks left
        })
    }

    let d = Object()
    let promise = makePromise ()
    d.promise = function () { return promise }
    d.resolve = function (result) {
        clearTimeout(bogusTimeout)
        resolve.apply(promise, arguments)
    }
    d.reject = function (error) {
        clearTimeout(bogusTimeout)
        reject.apply(promise, arguments)
    }
    return d
}
