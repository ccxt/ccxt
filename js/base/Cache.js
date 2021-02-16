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
            value: [],
            writable: true,
        })
    }

    append (item) {
        this.push (item)
        this.newUpdates.push (item)
        // maxSize may be 0 when initialized by a .filter() copy-construction
        if (this.maxSize && (this.length > this.maxSize)) {
            this.shift ()
        }
    }

    clearNewUpdates () {
        this.newUpdates = []
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
        Object.defineProperty (this, 'newUpdatesHashmap', {
            __proto__: null, // make it invisible
            value: new Set (),
            writable: true,
        })
    }

    append (item) {
        if (item[0] in this.hashmap) {
            const reference = this.hashmap[item[0]]
            if (reference !== item) {
                for (const prop in reference) {
                    delete reference[prop]
                }
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
        if (!this.newUpdatesHashmap.has (item[0])) {
            this.newUpdatesHashmap.add (item[0])
            this.newUpdates.push (item)
        }
    }

    clearNewUpdates () {
        this.newUpdates = []
        this.newUpdatesHashmap.clear ()
    }
}

class ArrayCacheBySymbolById extends ArrayCacheByTimestamp {

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
        if (!this.newUpdatesHashmap.has (item[item.id])) {
            this.newUpdatesHashmap.add (item[item.id])
            this.newUpdates.push (item)
        }
    }
}

module.exports = {
    ArrayCache,
    ArrayCacheByTimestamp,
    ArrayCacheBySymbolById,
}
