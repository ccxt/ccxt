'use strict';

// ----------------------------------------------------------------------------
// one half-side of an orderbook (bids or asks)
// overwrites absolute volumes at price levels

class OrderBookSide extends Array {

    // static get [Symbol.species] () { return Array }

    constructor (deltas = []) {
        super (deltas.length)
        // a string-keyed dictionary of price levels / ids / indices
        Object.defineProperty (this, 'index', {
            __proto__: null, // make it invisible
            value: {},
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
            this.index[price] = size // absolute volume at price level
        } else {
            delete this.index[price] // purge zero values
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
        const array = Object.entries (this.index).map (this.convert).sort (this.compare)
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

    // convert from string-keyed dict values to human types for userland
    convert ([ price, size ]) {
        return [ Number (price), size ]
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
        })
    }

    limit (n = undefined) {
        if (n) {
            return super.limit (Math.min (this.depth || Number.MAX_SAFE_INTEGER, n))
        } else {
            return super.limit (this.depth)
        }
    }
}

// ----------------------------------------------------------------------------
// overwrites absolute volumes at price levels
// or deletes price levels based on order counts (3rd value in a bidask delta)

class CountedOrderBookSide extends OrderBookSide {

    store (price, size, count) {
        if (count) {
            if (size) {
                this.index[price] = [ price, size, count ]
            } else {
                delete this.index[price]
            }
        } else {
            delete this.index[price]
        }
    }

    storeArray (delta) {
        const [ price, size, count ] = delta
        if (count) {
            if (size) {
                this.index[price] = delta
            } else {
                delete this.index[price]
            }
        } else {
            delete this.index[price]
        }
    }

    convert ([ _, [ price, size, count ]]) {
        return [ price, size, count ]
    }
}

// ----------------------------------------------------------------------------
// indexed by order ids (3rd value in a bidask delta)

class IndexedOrderBookSide extends OrderBookSide {

    store (price, size, id) {
        if (size) {
            this.index[id] = [ price, size, id ]
        } else {
            delete this.index[id]
        }
    }

    storeArray (delta) {
        // const [ price, size, id ] = delta
        // const price = delta[0]
        const size = delta[1]
            , id = delta[2]
        if (size) {
            this.index[id] = delta
        } else {
            delete this.index[id]
        }
    }

    convert ([ _, [ price, size, id ]]) {
        return [ price, size, id ]
    }
}

// ----------------------------------------------------------------------------
// adjusts the volumes by positive or negative relative changes or differences

class IncrementalOrderBookSide extends OrderBookSide {

    store (price, size) {
        if (size) {
            this.index[price] = (this.index[price] || 0) + size
            if (!this.index[price]) {
                delete this.index[price]
            }
        } else {
            delete this.index[price]
        }
    }
}

// ----------------------------------------------------------------------------
// incremental and indexed (2 in 1)

class IncrementalIndexedOrderBookSide extends IndexedOrderBookSide {

    store (price, size, id) {
        if (size) {
            size = (this.index[id] ? this.index[id][1] : 0) + size
            if (size) {
                this.index[id] = [ price, size, id ]
            } else {
                delete this.index[id]
            }
        } else {
            delete this.index[id]
        }
    }

    storeArray (delta) {
        // const [ price, size, id ] = delta
        const price = delta[0]
            , size = delta[1]
            , id = delta[2]
        this.store (price, size, id)
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

    // order-id + incremental
    IncrementalIndexedAsks,
    IncrementalIndexedBids,
    IncrementalIndexedOrderBookSide,
}
