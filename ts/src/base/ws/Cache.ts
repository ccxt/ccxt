/* eslint-disable max-classes-per-file */
// @ts-nocheck
import { Int } from '../types.js';

interface CustomArray extends Array<any> {
    hashmap: object;
}

class BaseCache extends Array {

    constructor (maxSize: Int = undefined) {
        super ()
        Object.defineProperty (this, 'maxSize', {
            __proto__: null, // make it invisible
            value: maxSize,
            writable: true,
        })
    }

    clear () {
        this.length = 0
    }
}

class ArrayCache extends BaseCache implements CustomArray {

    hashmap: object = {};

    constructor (maxSize: Int = undefined) {
        super (maxSize);
        Object.defineProperty (this, 'nestedNewUpdatesBySymbol', {
            __proto__: null, // make it invisible
            value: false,
            writable: true,
        })
        Object.defineProperty (this, 'newUpdatesBySymbol', {
            __proto__: null, // make it invisible
            value: {},
            writable: true,
        })
        // the distinct ids/sides seen per key since the last getLimit (), kept by the
        // keyed subclasses; newUpdatesBySymbol only ever holds the resulting count
        Object.defineProperty (this, 'seenUpdatesBySymbol', {
            __proto__: null, // make it invisible
            value: {},
            writable: true,
        })
        Object.defineProperty (this, 'clearUpdatesBySymbol', {
            __proto__: null, // make it invisible
            value: {},
            writable: true,
        })
        Object.defineProperty (this, 'allNewUpdates', {
            __proto__: null, // make it invisible
            value: 0,
            writable: true,
        })
        Object.defineProperty (this, 'clearAllUpdates', {
            __proto__: null, // make it invisible
            value: false,
            writable: true,
        })
        Object.defineProperty (this, 'hashmap', {
            __proto__: null, // make it invisible
            value: {},
            writable: true,
            enumerable: false,
        })
    }

    getLimit (symbol, limit) {
        let newUpdatesValue: Bool = undefined

        if (symbol === undefined) {
            newUpdatesValue = this.allNewUpdates
            this.clearAllUpdates = true
        } else {
            newUpdatesValue = this.newUpdatesBySymbol[symbol];
            this.clearUpdatesBySymbol[symbol] = true
        }

        if (newUpdatesValue === undefined) {
            return limit
        } else if (limit !== undefined) {
            return Math.min (newUpdatesValue, limit)
        } else {
            return newUpdatesValue;
        }
    }

    clear () {
        super.clear ()
        // the keyed subclasses find existing rows through the hashmap, so a clear ()
        // that only truncates the array leaves the hashmap claiming rows that are
        // gone - the next append then merges into an orphaned reference, and the
        // findIndex below returns -1, so the row is silently lost. The update
        // counters have to go too, or getLimit () keeps reporting updates for rows
        // that no longer exist.
        this.hashmap = {}
        this.newUpdatesBySymbol = {}
        this.seenUpdatesBySymbol = {}
        this.clearUpdatesBySymbol = {}
        this.allNewUpdates = 0
        this.clearAllUpdates = false
    }

    append (item) {
        // maxSize may be 0 when initialized by a .filter() copy-construction
        if (this.maxSize && (this.length === this.maxSize)) {
            this.shift ()
        }
        this.push (item)
        if (this.clearAllUpdates) {
            this.clearAllUpdates = false
            this.clearUpdatesBySymbol = {}
            this.allNewUpdates = 0
            this.newUpdatesBySymbol = {}
            this.seenUpdatesBySymbol = {}
        }
        if (this.clearUpdatesBySymbol[item.symbol]) {
            this.clearUpdatesBySymbol[item.symbol] = false
            this.newUpdatesBySymbol[item.symbol] = 0
        }
        this.newUpdatesBySymbol[item.symbol] = (this.newUpdatesBySymbol[item.symbol] || 0) + 1
        this.allNewUpdates = (this.allNewUpdates || 0) + 1
    }
}

class ArrayCacheByTimestamp extends BaseCache {

    constructor (maxSize: Int = undefined) {
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

    getLimit (symbol, limit) {
        this.clearUpdates = true
        if (limit === undefined) {
            return this.newUpdates
        }
        return Math.min (this.newUpdates, limit)
    }

    clear () {
        super.clear ()
        // without this the hashmap still claims every timestamp it has ever seen,
        // so re-appending a known timestamp merges into a reference that is no
        // longer in the array and the candle is dropped
        this.hashmap = {}
        this.sizeTracker.clear ()
        this.newUpdates = 0
        this.clearUpdates = false
    }

    append (item) {
        if (item[0] in this.hashmap) {
            const reference = this.hashmap[item[0]]
            if (reference !== item) {
                // OHLCV rows are arrays, so a "for prop in item" merge only walks the
                // indices the incoming row happens to have - a shorter update then
                // leaves the previous row's trailing values in place, e.g.
                // [100,1,2,3,4,5] followed by [100,9,9] used to yield [100,9,9,3,4,5].
                // Iterate the incoming item and drop whatever it does not cover.
                for (let i = 0; i < item.length; i++) {
                    reference[i] = item[i]
                }
                reference.length = item.length
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

class ArrayCacheBySymbolById extends ArrayCache {

    constructor (maxSize: Int = undefined) {
        super (maxSize)
        this.nestedNewUpdatesBySymbol = true
        // non-enumerable so it stays invisible to array equality/iteration (this extends Array);
        // the item field used as the first nesting level, overridden by ArrayCacheByOutcomeById
        Object.defineProperty (this, 'keyField', {
            __proto__: null, // make it invisible
            value: 'symbol',
            writable: true,
        })
    }

    append (item) {
        const key = item[this.keyField]
        const byId = this.hashmap[key] = this.hashmap[key] || {}
        if (item.id in byId) {
            const reference = byId[item.id]
            if (reference !== item) {
                for (const prop in item) {
                    reference[prop] = item[prop]
                }
            }
            item = reference
            // match on both the key field (e.g. symbol) and id - different symbols
            // can share an order id (exchanges like binance use per-symbol id
            // sequences), and matching on id alone would splice out the wrong row
            const index = this.findIndex ((x) => (x.id === item.id) && (x[this.keyField] === item[this.keyField]))
            // move the order to the end of the array. Guard the miss: splice (-1, 1)
            // deletes the LAST row, so a hashmap entry with no matching row would
            // destroy an unrelated order instead of doing nothing.
            if (index >= 0) {
                this.splice (index, 1)
            }
        } else {
            byId[item.id] = item
        }
        if (this.maxSize && (this.length === this.maxSize)) {
            const deleteReference = this.shift ()
            const deleteKey = deleteReference[this.keyField]
            delete this.hashmap[deleteKey][deleteReference.id]
            // drop the outer bucket once its last id is gone, otherwise a stream with
            // many short-lived symbols leaks one empty object per symbol forever
            if (Object.keys (this.hashmap[deleteKey]).length === 0) {
                delete this.hashmap[deleteKey]
            }
        }
        this.push (item)
        if (this.clearAllUpdates) {
            this.clearAllUpdates = false
            this.clearUpdatesBySymbol = {}
            this.allNewUpdates = 0
            this.newUpdatesBySymbol = {}
            this.seenUpdatesBySymbol = {}
        }
        if (this.seenUpdatesBySymbol[key] === undefined) {
            this.seenUpdatesBySymbol[key] = new Set ()
        }
        if (this.clearUpdatesBySymbol[key]) {
            this.clearUpdatesBySymbol[key] = false
            this.seenUpdatesBySymbol[key].clear ()
        }
        // count distinct ids, in case an exchange updates the same order id twice
        const idSet = this.seenUpdatesBySymbol[key]
        const beforeLength = idSet.size
        idSet.add (item.id)
        const afterLength = idSet.size
        this.newUpdatesBySymbol[key] = afterLength
        this.allNewUpdates = (this.allNewUpdates || 0) + (afterLength - beforeLength)
    }
}

class ArrayCacheByOutcomeById extends ArrayCacheBySymbolById {

    constructor (maxSize: Int = undefined) {
        super (maxSize)
        this.keyField = 'outcome'
    }
}

class ArrayCacheBySymbolBySide extends ArrayCache {

    constructor () {
        super ()
        this.nestedNewUpdatesBySymbol = true
        Object.defineProperty (this, 'hashmap', {
            __proto__: null, // make it invisible
            value: {},
            writable: true,
        })
    }

    append (item) {
        const bySide = this.hashmap[item.symbol] = this.hashmap[item.symbol] || {}
        if (item.side in bySide) {
            const reference = bySide[item.side]
            if (reference !== item) {
                for (const prop in item) {
                    reference[prop] = item[prop]
                }
            }
            item = reference
            const index = this.findIndex ((x) => x.symbol === item.symbol && x.side === item.side)
            // move the position to the end of the array, guarding the miss so a
            // stale hashmap entry cannot splice (-1, 1) an unrelated row away
            if (index >= 0) {
                this.splice (index, 1)
            }
        } else {
            bySide[item.side] = item
        }
        this.push (item)
        if (this.clearAllUpdates) {
            this.clearAllUpdates = false
            this.clearUpdatesBySymbol = {}
            this.allNewUpdates = 0
            this.newUpdatesBySymbol = {}
            this.seenUpdatesBySymbol = {}
        }
        if (this.seenUpdatesBySymbol[item.symbol] === undefined) {
            this.seenUpdatesBySymbol[item.symbol] = new Set ()
        }
        if (this.clearUpdatesBySymbol[item.symbol]) {
            this.clearUpdatesBySymbol[item.symbol] = false
            this.seenUpdatesBySymbol[item.symbol].clear ()
        }
        // count distinct sides, in case an exchange updates the same side twice
        const sideSet = this.seenUpdatesBySymbol[item.symbol]
        const beforeLength = sideSet.size
        sideSet.add (item.side)
        const afterLength = sideSet.size
        this.newUpdatesBySymbol[item.symbol] = afterLength
        this.allNewUpdates = (this.allNewUpdates || 0) + (afterLength - beforeLength)
    }
}

export {
    ArrayCache,
    ArrayCacheByTimestamp,
    ArrayCacheBySymbolById,
    ArrayCacheByOutcomeById,
    ArrayCacheBySymbolBySide,
};
