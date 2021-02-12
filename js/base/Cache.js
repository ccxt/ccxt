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

    append (item) {
        this.push (item)
        // maxSize may be 0 when initialized by a .filter() copy-construction
        if (this.maxSize && (this.length > this.maxSize)) {
            this.shift ()
        }
    }

    clear () {
        this.length = 0
    }
}

class ArrayCacheByField extends ArrayCache {

    constructor (field, maxSize = undefined) {
        super (maxSize)
        Object.defineProperty (this, 'field', {
            __proto__: null, // make it invisible
            value: field,
        })
        Object.defineProperty (this, 'hashmap', {
            __proto__: null, // make it invisible
            value: {},
            writable: true,
        })
    }

    append (item) {
        if (item[this.field] in this.hashmap) {
            const reference = this.hashmap[item[this.field]]
            if (reference !== item) {
                for (const prop in reference) {
                    delete reference[prop]
                }
                for (const prop in item) {
                    reference[prop] = item[prop]
                }
            }
        } else {
            this.hashmap[item[this.field]] = item
            if (this.maxSize && (this.length === this.maxSize)) {
                const deleteReference = this.shift ()
                delete this.hashmap[deleteReference[this.field]]
            }
            this.push (item)
        }
    }
}

class ArrayCacheById extends ArrayCacheByField {

    constructor (maxSize = undefined) {
        super ('id', maxSize)
        Object.defineProperty (this, 'hashmap', {
            __proto__: null, // make it invisible
            value: {},
            writable: true,
        })
    }
}

class ArrayCacheByTimestamp extends ArrayCacheByField {

    constructor (maxSize = undefined) {
        // the timestamp in an ohlcv is the zeroth index
        super (0, maxSize)
        Object.defineProperty (this, 'hashmap', {
            __proto__: null, // make it invisible
            value: {},
            writable: true,
        })
    }
}

class ArrayCacheBySymbolById extends ArrayCacheById {

    append (item) {
        const byId = this.hashmap[item.symbol] = this.hashmap[item.symbol] || {}
        if (item.id in byId) {
            const reference = byId[item.id]
            if (reference !== item) {
                for (const prop in reference) {
                    delete reference[prop]
                }
                for (const prop in item) {
                    reference[prop] = item[prop]
                }
            }
        } else {
            byId[item.id] = item
            if (this.maxSize && (this.length === this.maxSize)) {
                const deleteReference = this.shift ()
                delete byId[deleteReference.id]
            }
            this.push (item)
        }
    }
}

module.exports = {
    ArrayCache,
    ArrayCacheById,
    ArrayCacheByTimestamp,
    ArrayCacheBySymbolById,
}
