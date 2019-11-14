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

// ----------------------------------------------------------------------------
// TODO: rework
//
//  Instead of:
//
//      p.resolve (..)
//      p = externallyResolvablePromise ()
//
//  Do:
//
//      p.resolve (...) // does promise re-issuing internally
//
//  And reference to the actual promise like that:
//
//      p.value

// ----------------------------------------------------------------------------
// Actually, on a second thought, the true-syntax is
//
//     const x = externallyResolvablePromise ()
//     await x
//     await x
//     await x
//     x.resolve ()
//     await x
//     ...
//

module.exports = function externallyResolvablePromise () {

    const create = function create () {

        let resolve = undefined,
            reject = undefined,
            bogusTimeout = undefined

        let p = new Promise ((resolve_, reject_) => {
            resolve = resolve_
            reject = reject_
            bogusTimeout = setTimeout (() => {}, 1000000000) // prevents unwanted process termination when no more event loop tasks left
        })

        p.resolved = false

        p.resolve = function _resolve () {
            p.resolved = true
            clearTimeout (bogusTimeout)
            resolve.apply (this, arguments)
            p = create ()
            return p
        }

        p.reject = function _reject () {
            p.resolved = true
            clearTimeout (bogusTimeout)
            reject.apply (this, arguments)
            p = create ()
            return p
        }

        return p
    }

    return create ()
}
