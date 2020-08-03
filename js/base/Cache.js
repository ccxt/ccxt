'use strict';

class ArrayCache extends Array {

    constructor (maxSize = undefined) {
        super ()
        Object.defineProperty (this, 'maxSize', {
            __proto__: null, // make it invisible
            value: maxSize,
            writable: true,
        })
    }

    push () {
        throw new Error ('Cannot push to a cache, please use append instead')
    }

    append (item) {
        super.push (item)
        // maxSize may be 0 when initialized by a .filter() copy-construction
        if (this.maxSize && (this.length > this.maxSize)) {
            this.shift ()
        }
    }

    clear () {
        this.length = 0
    }
}

class ArrayCacheBySymbolById extends ArrayCache {

    append (item) {
        const index = this.findIndex ((stored) =>
            ((stored['symbol'] === item['symbol']) && (stored['id'] === item['id'])))
        if (index >= 0) {
            this[index] = item
        } else {
            super.append (item)
        }
    }
}

module.exports = {
    ArrayCache,
    ArrayCacheBySymbolById,
}
