'use strict';

// ----------------------------------------------------------------------------
// one half-side of an orderbook (bids or asks)
// overwrites absolute volumes at price levels
// this class stores scalar order sizes indexed by price

class OrderBookSide extends Array {
    constructor (deltas = [], depth = Number.MAX_SAFE_INTEGER, limitType = 0) {
        super (deltas.length)
        // a string-keyed dictionary of price levels / ids / indices
        Object.defineProperty (this, 'index', {
            __proto__: null, // make it invisible
            value: new Map (),
            writable: true,
        })
        Object.defineProperty (this, 'depth', {
            __proto__: null, // make it invisible
            value: depth,
            writable: true,
        })
        Object.defineProperty (this, 'limitType', {
            __proto__: null, // make it invisible
            value: limitType,
            writable: true,
        })
        for (let i = 0; i < deltas.length; i++) {
            this.storeArray (deltas[i])
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
    limit (n = Number.MAX_SAFE_INTEGER) {
        const array = Array.from ( this.limitType ? this.index.values () : this.index.entries ()).sort (this.compare)
        const threshold = Math.min (this.depth, array.length)
        this.index = new Map ()
        for (let i = 0; i < threshold; i++) {
            this[i] = array[i];
            const price = array[i][0]
            if (this.limitType) {
                const last = array[i][2]
                this.index.set (this.limitType & 1 ? price : last, array[i])
            } else {
                const size = array[i][1]
                this.index.set (price, size)
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
        super (deltas, depth, 1)
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
        super (deltas, depth, 2)
    }

    store (price, size, id) {
        if (size) {
            if (!price) {
                const array = this.index.get (id)
                if (array) {
                    price = array[0]
                }
            }
            this.index.set (id, [ price, size, id ])
        } else {
            this.index.delete (id)
        }
    }

    restore (price = undefined, size, id) {
        return this.store (price, size, id)
    }

    storeArray (delta) {
        const size = delta[0]
        let price = delta[1]
        const id = delta[2]
        if (size) {
            if (!price) {
                const array = this.index.get (id)
                if (array) {
                    price = array[0]
                    this.index.set (id, [ price, size, id ])
                    return
                }
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
        super (deltas, depth, 0)
    }

    store (price, size) {
        size = (this.index.get (price) || 0) + size
        this.index.set (price, size)
        if (size <= 0) {
            this.index.delete (price)
        }
    }

    storeArray (delta) {
        const price = delta[0]
            , size = (this.index.get (price) || 0) + delta[1]
        this.index.set (price, size)
        if (size <= 0) {
            this.index.delete (price)
        }
    }
}

// ----------------------------------------------------------------------------
// incremental and indexed (2 in 1)
const FALLBACK = [null, 0, null]

class IncrementalIndexedOrderBookSide extends IndexedOrderBookSide {
    store (price, size, id) {
        const stored = this.index.get (id) || FALLBACK
        if (size && size + stored[1] >= 0) {
            if (price === stored[0]) {
                this.index.set (id, [ price, size + stored[1], id ])
            } else {
                this.index.set (id, [ price, size, id ])
            }
        } else {
            this.index.delete (id)
        }
    }

    storeArray (delta) {
        const [ price, size, id ] = delta
        const stored = this.index.get (id) || FALLBACK
        if (size && size + stored[1] >= 0) {
            if (price === stored[0]) {
                this.index.set (id, [ price, size + stored[1], id ])
            } else {
                this.index.set (id, delta)
            }
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
}
