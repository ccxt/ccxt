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

    constructor (maxSize = undefined) {
        super (maxSize)
        Object.defineProperty (this, 'hashMap', {
            __proto__: null, // make it invisible
            value: {},
            writable: true,
        })
    }

    append (item) {
        const byId = this.hashMap[item.symbol] = this.hashMap[item.symbol] || {}
        if (item.id in byId) {
            const reference = byId[item.id]
            for (const prop in reference) {
                delete reference[prop]
            }
            for (const prop in item) {
                reference[prop] = item[prop]
            }
        } else {
            byId[item.id] = item
            if (this.length === this.maxSize) {
                const deleteReference = this.pop ()
                delete byId[deleteReference.id]
            }
            super.append (item)
        }
    }
}

module.exports = {
    ArrayCache,
    ArrayCacheBySymbolById,
}
