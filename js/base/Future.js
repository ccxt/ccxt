'use strict'

module.exports = function Future () {

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
