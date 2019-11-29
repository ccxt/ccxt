'use strict';

// ----------------------------------------------------------------------------
// one half-side of an orderbook (bids or asks)
// overwrites absolute volumes at price levels

class OrderBookSide extends Array {
    constructor (deltas = []) {
        super (deltas.length)
        // a string-keyed dictionary of price levels / ids / indices
        Object.defineProperty (this, 'index', {
            __proto__: null, // make it invisible
            value: new Map (),
            writable: true,
        })
        if (deltas.length) {
            this.update (deltas)
        }
    }

    // called for each orderbook update/frame/nonce with new incoming deltas
    update (deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.storeArray (deltas[i])
        }
        return this.limit ()
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
        const array = Array.from (this.index.entries ()).sort (this.compare)
        n = Math.min (n || Number.MAX_SAFE_INTEGER, array.length)
        // the following lines could be written as
        //     this.splice (0, this.length, ... array)
        // however, both .splice and .slice copy-construct the arrays
        // so we assign the elements manually in favor of splice and slice
        for (let i = 0; i < n; i++) {
            this[i] = array[i]
        }
        // truncate the array by setting the length
        // which is a legitimate operation in JS
        this.length = n
        return this
    }
}

class LimitByValues extends OrderBookSide {
    limit (n = undefined) {
        const array = Array.from (this.index.values ()).sort (this.compare)  // use values here instead of entries
        n = Math.min (n || Number.MAX_SAFE_INTEGER, array.length)
        // the following lines could be written as
        //     this.splice (0, this.length, ... array)
        // however, both .splice and .slice copy-construct the arrays
        // so we assign the elements manually in favor of splice and slice
        for (let i = 0; i < n; i++) {
            this[i] = array[i]
        }
        // truncate the array by setting the length
        // which is a legitimate operation in JS
        this.length = n
        return this
    }
}

// ----------------------------------------------------------------------------
// some exchanges limit the number of bids/asks in the aggregated orderbook
// orders beyond the limit threshold are not updated with new ws deltas
// those orders should not be returned to the user, they are outdated quickly

class LimitedOrderBookSide extends OrderBookSide {
    constructor (deltas = [], depth = undefined) {
        super (deltas)
        Object.defineProperty (this, 'depth', {
            __proto__: null, // make it invisible
            value: depth,
            writable: true,
        })
    }

    limit (n = undefined) {
        const array = Array.from (this.index.entries ()).sort (this.compare)
        const depth = Math.min (this.depth || Number.MAX_SAFE_INTEGER, n || Number.MAX_SAFE_INTEGER)
        const threshold = Math.min (array.length, depth)
        this.index = new Map ()
        for (let i = 0; i < threshold; i++) {
            this[i] = array[i];
            const price = array[i][0]
            const size = array[i][1]
            this.index.set (price, size)
        }
        this.length = threshold;
        return this
    }
}

// ----------------------------------------------------------------------------
// overwrites absolute volumes at price levels
// or deletes price levels based on order counts (3rd value in a bidask delta)

class CountedOrderBookSide extends LimitByValues {
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
// indexed by order ids (3rd value in a bidask delta)

class IndexedOrderBookSide extends LimitByValues {
    store (price, size, id) {
        if (size) {
            this.index.set (id, [ price, size, id ])
        } else {
            this.index.delete (id)
        }
    }

    restore (price = undefined, size, id) {
        if (size) {
            const array = this.index.get (id)
            array[0] = price || array[0]
            array[1] = size
        } else {
            this.index.delete (id)
        }
    }

    storeArray (delta) {
        // const [ price, size, id ] = delta
        // const price = delta[0]
        const size = delta[1]
            , id = delta[2]
        if (size) {
            this.index.set (id, delta)
        } else {
            this.index.delete (id)
        }
    }
}

// ----------------------------------------------------------------------------
// adjusts the volumes by positive or negative relative changes or differences

class IncrementalOrderBookSide extends OrderBookSide {
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
// limited and order-id-based

class LimitedIndexedOrderBookSide extends IndexedOrderBookSide {
    constructor (deltas = [], depth = undefined) {
        super (deltas)
        Object.defineProperty (this, 'depth', {
            __proto__: null, // make it invisible
            value: depth,
            writable: true,
        })
    }

    limit (n = undefined) {
        const array = Array.from (this.index.entries ()).sort (this.compare)
        const depth = n ? Math.min (this.depth || Number.MAX_SAFE_INTEGER, n) : this.depth
        const threshold = Math.min (array.length, depth)
        this.index = new Map ()
        for (let i = 0; i < threshold; i++) {
            this[i] = array[i];
            const price = array[i][0]
            const size = array[i][1]
            const id = array[i][2]
            this.index.set (id, array[i])
        }
        this.length = threshold;
        return this
    }
}

// ----------------------------------------------------------------------------
// limited and count-based

class LimitedCountedOrderBookSide extends CountedOrderBookSide {
    constructor (deltas = [], depth = undefined) {
        super (deltas)
        Object.defineProperty (this, 'depth', {
            __proto__: null, // make it invisible
            value: depth,
            writable: true,
        })
    }

    limit (n = undefined) {
        const array = Array.from (this.index.entries ()).sort (this.compare)
        const depth = n ? Math.min (this.depth || Number.MAX_SAFE_INTEGER, n) : this.depth
        const threshold = Math.min (array.length, depth)
        this.index = new Map ()
        for (let i = 0; i < threshold; i++) {
            this[i] = array[i];
            const price = array[i][0]
            const size = array[i][1]
            const id = array[i][2]
            this.index.set (price, array[i])
        }
        this.length = threshold;
        return this
    }
}

// ----------------------------------------------------------------------------
// incremental and indexed (2 in 1)

class IncrementalIndexedOrderBookSide extends IndexedOrderBookSide {
    store (price, size, id) {
        if (size) {
            size = (this.index.get (id) || 0) + size
            if (size > 0) {
                this.index.set (id, [ price, size, id ])
            } else {
                this.index.delete (id)
            }
        } else {
            this.index.delete (id)
        }
    }

    storeArray (delta) {
        // const [ price, size, id ] = delta
        const price = delta[0]
            , id = delta[2]
        let size = delta[1]
        if (size) {
            size = (this.index.get (id) || 0) + size
            if (size > 0) {
                this.index.set (id, [ price, size, id ])
            } else {
                this.index.delete (id)
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
class LimitedAsks extends LimitedOrderBookSide { compare (a, b) { return a[0] - b[0] }}
class LimitedBids extends LimitedOrderBookSide { compare (a, b) { return b[0] - a[0] }}
class CountedAsks extends CountedOrderBookSide { compare (a, b) { return a[0] - b[0] }}
class CountedBids extends CountedOrderBookSide { compare (a, b) { return b[0] - a[0] }}
class IndexedAsks extends IndexedOrderBookSide { compare (a, b) { return a[0] - b[0] }}
class IndexedBids extends IndexedOrderBookSide { compare (a, b) { return b[0] - a[0] }}
class IncrementalAsks extends IncrementalOrderBookSide { compare (a, b) { return a[0] - b[0] }}
class IncrementalBids extends IncrementalOrderBookSide { compare (a, b) { return b[0] - a[0] }}
class LimitedIndexedAsks extends LimitedIndexedOrderBookSide { compare (a, b) { return a[0] - b[0] }}
class LimitedIndexedBids extends LimitedIndexedOrderBookSide { compare (a, b) { return b[0] - a[0] }}
class LimitedCountedAsks extends LimitedCountedOrderBookSide { compare (a, b) { return a[0] - b[0] }}
class LimitedCountedBids extends LimitedCountedOrderBookSide { compare (a, b) { return b[0] - a[0] }}
class IncrementalIndexedAsks extends IncrementalIndexedOrderBookSide { compare (a, b) { return a[0] - b[0] }}
class IncrementalIndexedBids extends IncrementalIndexedOrderBookSide { compare (a, b) { return b[0] - a[0] }}

// ----------------------------------------------------------------------------

module.exports = {

    // basic
    Asks,
    Bids,
    OrderBookSide,

    // limited
    LimitedAsks,
    LimitedBids,
    LimitedOrderBookSide,

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

    // limited + order-id based
    LimitedIndexedAsks,
    LimitedIndexedBids,
    LimitedIndexedOrderBookSide,

    // limited + count-based
    LimitedCountedAsks,
    LimitedCountedBids,
    LimitedCountedOrderBookSide,

    // order-id + incremental
    IncrementalIndexedAsks,
    IncrementalIndexedBids,
    IncrementalIndexedOrderBookSide,
}
