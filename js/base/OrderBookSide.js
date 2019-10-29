'use strict';

// ----------------------------------------------------------------------------
// one half-side of an orderbook (bids or asks)
// overwrites absolute volumes at price levels

class OrderBookSide extends Array {

    constructor (... params) {
        super (... params)
        // a string-keyed dictionary of price levels / ids / indices
        Object.defineProperty (this, 'index', {
            __proto__: null,
            value: {},
        })
    }

    // called for each orderbook update/frame/nonce with new incoming deltas
    update (deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.store (deltas[i])
        }
        return this.reset (this.index)
    }

    // index an incoming delta in the string-keyed dictionary
    store (delta) {
        const [ price, size ] = delta
        if (size) {
            this.index[price] = size // absolute volume at price level
        } else {
            delete this.index[price] // purge zero values
        }
    }

    // replace stored orders with new values
    reset (array) {
        array = Object.entries (array).map (this.convert).sort (this.compare)
        return this.splice (0, this.length, ... array)
    }

    // convert from string-keyed dict values to human types for userland
    convert ([ price, size ]) {
        return [ Number (price), size ]
    }
}

// ----------------------------------------------------------------------------
// overwrites absolute volumes at price levels
// or deletes price levels based on order counts (3rd value in a bidask delta)

class CountedOrderBookSide extends OrderBookSide {

    store (delta) {
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

    store (delta) {
        const [ price, size, id ] = delta
        if (size) {
            this.index[id] = delta
        } else {
            delete this.index[id]
        }
    }

    convert ([ id, [ price, size, _ ]]) {
        return [ price, size, id ]
    }
}

// ----------------------------------------------------------------------------
// adjusts the volumes by positive or negative relative changes or differences

class IncrementalOrderBookSide extends OrderBookSide {

    store (delta) {
        const [ price, size ] = delta
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

    store (delta) {
        const [ price, size, id ] = delta
        if (size) {
            const after = (this.index[id] ? this.index[id][1] : 0) + size
            if (after) {
                this.index[id] = [ price, after, id ]
            } else {
                delete this.index[id]
            }
        } else {
            delete this.index[id]
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
