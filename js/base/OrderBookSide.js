/* eslint-disable max-classes-per-file */

'use strict';

// ----------------------------------------------------------------------------
// binary insert optimizations by Carlo Revelli
// carlo.revelli@berkeley.edu
// one half-side of an orderbook (bids or asks)
// overwrites absolute volumes at price levels
// this class stores scalar order sizes indexed by price

function bisectLeft(array, x) {
    let low = 0
    let high = array.length
    while (low < high) {
        const mid = (low + high) >>> 1;
        if (array[mid] - x < 0) low = mid + 1;
        else high = mid;
    }
    return low;
}

const LIMIT_BY_KEY = 0
const LIMIT_BY_VALUE_PRICE_KEY = 1
const LIMIT_BY_VALUE_INDEX_KEY = 2

class OrderBookSide extends Array {
    constructor (deltas = [], depth = undefined, limitType = LIMIT_BY_KEY) {
        super (deltas.length)
        // a string-keyed dictionary of price levels / ids / indices
        Object.defineProperty (this, 'index', {
            __proto__: null, // make it invisible
            value: [],
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

    storeArray (delta) {
        const price = delta[0]
        const size = delta[1]
        const index_price = this.side ? -price : price
        const index = bisectLeft (this.index, index_price)
        if (size) {
            if (index < this.index.length && this.index[index] === index_price) {
                this[index][1] = size
            } else {
                this.index.splice (index, 0, index_price)
                this.splice (index, 0, delta)
            }
        } else if (index < this.index.length && this.index[index] === index_price) {
            this.index.splice (index, 1)
            this.splice (index, 1)
        }
    }

    // index an incoming delta in the string-price-keyed dictionary
    store (price, size) {
        this.storeArray ([ price, size ])
    }

    // replace stored orders with new values
    limit (n = undefined) {
        return
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
        this.storeArray ([ price, size, count ])
    }

    storeArray (delta) {
        const price = delta[0]
        const size = delta[1]
        const count = delta[2]
        const index_price = this.side ? -price : price
        const index = bisectLeft (this.index, index_price)
        if (size && count) {
            if (index < this.index.length && this.index[index] === index_price) {
                this[index][1] = size
            } else {
                this.index.splice (index, 0, index_price)
                this.splice (index, 0, delta)
            }
        } else if (index < this.index.length && this.index[index] === index_price) {
            this.index.splice (index, 1)
            this.splice (index, 1)
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
