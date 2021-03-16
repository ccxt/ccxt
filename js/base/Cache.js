'use strict';

class ArrayCache extends Array {

    constructor (maxSize = undefined) {
        super ()
        Object.defineProperty (this, 'maxSize', {
            __proto__: null, // make it invisible
            value: maxSize,
            writable: true,
        })
        Object.defineProperty (this, 'newUpdates', {
            __proto__: null, // make it invisible
            value: 0,
            writable: true,
        })
        Object.defineProperty (this, 'clearUpdates', {
            __proto__: null, // make it invisible
            value: false,
            writable: true,
        })
    }

    getLimit (limit) {
        this.clearUpdates = true
        if (limit === undefined) {
            return this.newUpdates
        }
        return Math.min (this.newUpdates, limit)
    }

    append (item) {
        // maxSize may be 0 when initialized by a .filter() copy-construction
        if (this.maxSize && (this.length === this.maxSize)) {
            this.shift ()
        }
        this.push (item)
        if (this.clearUpdates) {
            this.clearUpdates = false
            this.newUpdates = 0
        }
        this.newUpdates++
    }

    clear () {
        this.length = 0
    }
}

class ArrayCacheByTimestamp extends ArrayCache {

    constructor (maxSize = undefined) {
        super (maxSize)
        Object.defineProperty (this, 'hashmap', {
            __proto__: null, // make it invisible
            value: {},
            writable: true,
        })
        Object.defineProperty (this, 'sizeTracker', {
            __proto__: null, // make it invisible
            value: new Set (),
            writable: true,
        })
    }

    append (item) {
        if (item[0] in this.hashmap) {
            const reference = this.hashmap[item[0]]
            if (reference !== item) {
                for (const prop in item) {
                    reference[prop] = item[prop]
                }
            }
        } else {
            this.hashmap[item[0]] = item
            if (this.maxSize && (this.length === this.maxSize)) {
                const deleteReference = this.shift ()
                delete this.hashmap[deleteReference[0]]
            }
            this.push (item)
        }
        if (this.clearUpdates) {
            this.clearUpdates = false
            this.sizeTracker.clear ()
        }
        this.sizeTracker.add (item[0])
        this.newUpdates = this.sizeTracker.size
    }
}

class ArrayCacheBySymbolById extends ArrayCacheByTimestamp {

    constructor (maxSize = undefined) {
        super (maxSize)
    }

    append (item) {
        const byId = this.hashmap[item.symbol] = this.hashmap[item.symbol] || {}
        if (item.id in byId) {
            const reference = byId[item.id]
            if (reference !== item) {
                for (const prop in item) {
                    reference[prop] = item[prop]
                }
            }
            item = reference
            const index = this.findIndex (x => x.id === item.id)
            // move the order to the end of the array
            this.splice (index, 1)
        } else {
            byId[item.id] = item
        }
        if (this.maxSize && (this.length === this.maxSize)) {
            const deleteReference = this.shift ()
            delete byId[deleteReference.id]
        }
        this.push (item)
        if (this.clearUpdates) {
            this.clearUpdates = false
            this.newUpdates = 0
        }
        this.newUpdates++
    }
}

module.exports = {
    ArrayCache,
    ArrayCacheByTimestamp,
    ArrayCacheBySymbolById,
}
