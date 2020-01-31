'use strict';

// ----------------------------------------------------------------------------
// one half-side of an orderbook (bids or asks)
// overwrites absolute volumes at price levels
// this class stores scalar order sizes indexed by price

const LIMIT_BY_KEY = 0
const LIMIT_BY_VALUE_PRICE_KEY = 1
const LIMIT_BY_VALUE_INDEX_KEY = 2

class OrderBookSide extends Array {
    constructor (deltas = [], depth = undefined, limitType = LIMIT_BY_KEY) {
        super (deltas.length)
        // a string-keyed dictionary of price levels / ids / indices
        Object.defineProperty (this, 'index', {
            __proto__: null, // make it invisible
            value: new Map (),
            writable: true,
        })
        Object.defineProperty (this, 'depth', {
            __proto__: null, // make it invisible
            value: depth || Number.MAX_SAFE_INTEGER,
            writable: true,
        })
        Object.defineProperty (this, 'limitType', {
            __proto__: null, // make it invisible
            value: limitType,
            writable: true,
        })
        for (let i = 0; i < deltas.length; i++) {
            this.storeArray (deltas[i].slice ())  // slice is muy importante
        }
    }

    store (price, size) {
        if (size) {
            this.index.set (price, size) // absolute volume at price level)
        } else {
            this.index.delete (price) // purge zero values
        }
    }

    // index an incoming delta in the string-price-keyed dictionary
    storeArray (delta) {
        // const [ price, size ] = delta
        const price = delta[0]
        const size = delta[1]
        this.store (price, size)
    }

    // replace stored orders with new values
    limit (n = undefined) {
        n = n || Number.MAX_SAFE_INTEGER
        const elements = (this.limitType === LIMIT_BY_KEY) ? this.index.entries () : this.index.values ()
        const array = Array.from (elements).sort (this.compare)
        const threshold = Math.min (this.depth, array.length)
        this.index = new Map ()
        for (let i = 0; i < threshold; i++) {
            this[i] = array[i];
            const price = array[i][0]
            if (this.limitType === LIMIT_BY_KEY) {
                const size = array[i][1]
                this.index.set (price, size)
            } else {
                const last = array[i][2]
                if (this.limitType === LIMIT_BY_VALUE_PRICE_KEY) {
                    this.index.set (price, array[i])
                } else {
                    this.index.set (last, array[i])
                }
            }
        }
        this.length = Math.min (threshold, n);
        return this
    }
}

// ----------------------------------------------------------------------------
// overwrites absolute volumes at price levels
// or deletes price levels based on order counts (3rd value in a bidask delta)
// this class stores vector arrays of values indexed by price

class CountedOrderBookSide extends OrderBookSide {
    constructor (deltas = [], depth = Number.MAX_SAFE_INTEGER) {
        super (deltas, depth, LIMIT_BY_VALUE_PRICE_KEY)
    }

    store (price, size, count) {
        if (count && size) {
            this.index.set (price, [ price, size, count ])
        } else {
            this.index.delete (price)
        }
    }

    storeArray (delta) {
        const [ price, size, count ] = delta
        if (count && size) {
            this.index.set (price, delta)
        } else {
            this.index.delete (price)
        }
    }
}

// ----------------------------------------------------------------------------
// stores vector arrays indexed by id (3rd value in a bidask delta array)

class IndexedOrderBookSide extends OrderBookSide {
    constructor (deltas = [], depth = Number.MAX_SAFE_INTEGER) {
        super (deltas, depth, LIMIT_BY_VALUE_INDEX_KEY)
    }

    store (price, size, id) {
        if (size) {
            const stored = this.index.get (id)
            if (stored) {
                stored[0] = price || stored[0]
                stored[1] = size
                return
            }
            this.index.set (id, [ price, size, id ])
        } else {
            this.index.delete (id)
        }
    }

    storeArray (delta) {
        const [ price, size, id ] = delta
        if (size) {
            const stored = this.index.get (id)
            if (stored) {
                stored[0] = price || stored[0]
                stored[1] = size
                return
            }
            this.index.set (id, delta)
        } else {
            this.index.delete (id)
        }
    }
}

// ----------------------------------------------------------------------------
// adjusts the volumes by positive or negative relative changes or differences

class IncrementalOrderBookSide extends OrderBookSide {
    constructor (deltas = [], depth = Number.MAX_SAFE_INTEGER) {
        super (deltas, depth, LIMIT_BY_KEY)
    }

    store (price, size) {
        size = (this.index.get (price) || 0) + size
        if (size <= 0) {
            this.index.delete (price)
        } else {
            this.index.set (price, size)
        }
    }

    storeArray (delta) {
        const price = delta[0]
            , size = (this.index.get (price) || 0) + delta[1]
        if (size <= 0) {
            this.index.delete (price)
        } else {
            this.index.set (price, size)
        }
    }
}

// ----------------------------------------------------------------------------
// incremental and indexed (2 in 1)
class IncrementalIndexedOrderBookSide extends IndexedOrderBookSide {
    store (price, size, id) {
        if (size) {
            const stored = this.index.get (id)
            if (stored) {
                if (size + stored[1] >= 0) {
                    stored[0] = price || stored[0]
                    stored[1] = size + stored[1]
                    return
                }
            }
            this.index.set (id, [ price, size, id ])
        } else {
            this.index.delete (id)
        }
    }

    storeArray (delta) {
        const [ price, size, id ] = delta
        if (size) {
            const stored = this.index.get (id)
            if (stored) {
                if (size + stored[1] >= 0) {
                    stored[0] = price || stored[0]
                    stored[1] = size + stored[1]
                    return
                }
            }
            this.index.set (id, [ price, size, id ])
        } else {
            this.index.delete (id)
        }
    }
}

// ----------------------------------------------------------------------------
// a more elegant syntax is possible here, but native inheritance is portable

class Asks extends OrderBookSide { compare (a, b) { return a[0] - b[0] }}
class Bids extends OrderBookSide { compare (a, b) { return b[0] - a[0] }}
class CountedAsks extends CountedOrderBookSide { compare (a, b) { return a[0] - b[0] }}
class CountedBids extends CountedOrderBookSide { compare (a, b) { return b[0] - a[0] }}
class IndexedAsks extends IndexedOrderBookSide { compare (a, b) { return a[0] - b[0] }}
class IndexedBids extends IndexedOrderBookSide { compare (a, b) { return b[0] - a[0] }}
class IncrementalAsks extends IncrementalOrderBookSide { compare (a, b) { return a[0] - b[0] }}
class IncrementalBids extends IncrementalOrderBookSide { compare (a, b) { return b[0] - a[0] }}
class IncrementalIndexedAsks extends IncrementalIndexedOrderBookSide { compare (a, b) { return a[0] - b[0] }}
class IncrementalIndexedBids extends IncrementalIndexedOrderBookSide { compare (a, b) { return b[0] - a[0] }}

// ----------------------------------------------------------------------------

module.exports = {

    // basic
    Asks,
    Bids,
    OrderBookSide,

    // count-based
    CountedAsks,
    CountedBids,
    CountedOrderBookSide,

    // order-id based
    IndexedAsks,
    IndexedBids,
    IndexedOrderBookSide,

    // incremental
    IncrementalAsks,
    IncrementalBids,
    IncrementalOrderBookSide,

    // order-id + incremental
    IncrementalIndexedAsks,
    IncrementalIndexedBids,
    IncrementalIndexedOrderBookSide,

    // limit type constants
    LIMIT_BY_KEY,
    LIMIT_BY_VALUE_PRICE_KEY,
    LIMIT_BY_VALUE_INDEX_KEY,
}
