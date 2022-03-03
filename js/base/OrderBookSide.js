/* eslint-disable max-classes-per-file */

'use strict';

// ----------------------------------------------------------------------------
//
// Upto 10x speed improvement previous version
// Author: github.com/frosty00
// Email: carlo.revelli@berkeley.edu
//

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

const SIZE = 10000
const start = new Array (SIZE).fill (Number.MAX_VALUE)

class OrderBookSide extends Array {
    constructor (deltas = [], depth = undefined) {
        super (deltas.length)
        // a string-keyed dictionary of price levels / ids / indices
        Object.defineProperty (this, 'index', {
            __proto__: null, // make it invisible
            value: new Float64Array (start),
            writable: true,
        })
        Object.defineProperty (this, 'depth', {
            __proto__: null, // make it invisible
            value: depth || Number.MAX_SAFE_INTEGER,
            writable: true,
        })
        Object.defineProperty (this, 'prevLength', {
            __proto__: null, // make it invisible
            value: null,
            writable: true,
        })
        // sort upon initiation
        for (let i = 0; i < deltas.length; i++) {
            this.length = i
            this.storeArray (deltas[i].slice ())  // slice is muy importante
        }
    }

    storeArray (delta) {
        if (this.prevLength) {
            this.length = this.prevLength
        }
        const price = delta[0]
        const size = delta[1]
        const index_price = this.side ? -price : price
        const index = bisectLeft (this.index, index_price)
        if (size) {
            if (index < this.index.length && this.index[index] == index_price) {
                this[index][1] = size
            } else {
                this.length++
                this.index.copyWithin (index + 1, index, this.length)
                this.index[index] = index_price
                const innerIndex = this.side ? this.length - index - 1: index;
                this.copyWithin (index + 1, index, this.length)
                this[index] = delta
            }
        } else if (this.index[index] == index_price) {
            this.index.copyWithin (index, index + 1, this.length)
            this.index[this.length - 1] = Number.MAX_VALUE
            this.copyWithin (index, index + 1, this.length)
            this.length--
        }
    }

    // index an incoming delta in the string-price-keyed dictionary
    store (price, size) {
        this.storeArray ([ price, size ])
    }

    // replace stored orders with new values
    limit (n = undefined) {
        if (this.length > this.depth) {
            for (let i = this.depth; i < this.length; i++) {
                this.index[i] = Number.MAX_VALUE
            }
            this.length = this.depth
        }
        if (n !== undefined) {
            this.length = Math.min (n, this.length)
        }
    }
}

// ----------------------------------------------------------------------------
// overwrites absolute volumes at price levels
// or deletes price levels based on order counts (3rd value in a bidask delta)
// this class stores vector arrays of values indexed by price

class CountedOrderBookSide extends OrderBookSide {
    store (price, size, count) {
        this.storeArray ([ price, size, count ])
    }

    storeArray (delta) {
        if (this.prevLength) {
            this.length = this.prevLength
        }
        const price = delta[0]
        const size = delta[1]
        const index_price = this.side ? -price : price
        const index = bisectLeft (this.index, index_price)
        if (size && count) {
            if (index < this.index.length && this.index[index] == index_price) {
                this[index][1] = size
            } else {
                this.length++
                this.index.copyWithin (index + 1, index, this.length)
                this.index[index] = index_price
                const innerIndex = this.side ? this.length - index - 1: index;
                this.copyWithin (index + 1, index, this.length)
                this[index] = delta
            }
        } else if (this.index[index] == index_price) {
            this.index.copyWithin (index, index + 1, this.length)
            this.index[this.length - 1] = Number.MAX_VALUE
            this.copyWithin (index, index + 1, this.length)
            this.length--
        }
    }
}

// ----------------------------------------------------------------------------
// stores vector arrays indexed by id (3rd value in a bidask delta array)

class IndexedOrderBookSide extends Array  {
    constructor (deltas = [], depth = Number.MAX_SAFE_INTEGER) {
        super (deltas, depth)
        // a string-keyed dictionary of price levels / ids / indices
        Object.defineProperty (this, 'hashmap', {
            __proto__: null, // make it invisible
            value: new Map (),
            writable: true,
        })
        Object.defineProperty (this, 'index', {
            __proto__: null, // make it invisible
            value: new Float64Array (start),
            writable: true,
        })
        Object.defineProperty (this, 'depth', {
            __proto__: null, // make it invisible
            value: depth || Number.MAX_SAFE_INTEGER,
            writable: true,
        })
        Object.defineProperty (this, 'prevLength', {
            __proto__: null, // make it invisible
            value: null,
            writable: true,
        })
        // sort upon initiation
        for (let i = 0; i < deltas.length; i++) {
            this.length = i
            this.storeArray (deltas[i].slice ())  // slice is muy importante
        }
    }

    store (price, size, id) {
        this.storeArray([ price, size, id ])
    }

    storeArray (delta) {
        const price = delta[0]
        const size = delta[1]
        const id = delta[2]
        let index_price
        if (price !== undefined) {
            index_price = this.side ? -price : price
        } else {
            index_price = undefined
        }
        if (size) {
            if (this.hashmap.has (id)) {
                const old_price = this.hashmap.get (id)
                index_price = index_price || old_price
                // in case price is not sent
                delta[0] = Math.abs (index_price)
                if (index_price === old_price) {
                    const index = bisectLeft (this.index, index_price)
                    this.index[index] = index_price
                    this[index] = delta
                    return
                } else {
                    // remove old price from index
                    const old_index = bisectLeft (this.index, old_price)
                    this.index[old_index] = Number.MAX_VALUE
                    this.copyWithin (old_index, old_index + 1, this.length)
                }
            }
            // insert new price level
            this.hashmap.set (id, index_price)
            const index = bisectLeft (this.index, index_price)
            // insert new price level into index
            this.length++
            this.index.copyWithin (index + 1, index, this.length)
            this.index[index] = index_price
            const innerIndex = this.side ? this.length - index - 1: index;
            this.copyWithin (index + 1, index, this.length)
            this[index] = delta
        } else if (this.hashmap.has (id)) {
            const old_price = this.hashmap.get (id)
            const index = bisectLeft (this.index, old_price)
            this.index.copyWithin (index, index + 1, this.length)
            this.index[this.length - 1] = Number.MAX_VALUE
            this.copyWithin (index, index + 1, this.length)
            this.hashmap.delete (id)
            this.length--
        }
    }

    // replace stored orders with new values
    limit (n = undefined) {
        if (this.length > this.depth) {
            for (let i = this.depth; i < this.length; i++) {
                this.hashmap.delete (this.index[i])
                this.index[i] = Number.MAX_VALUE
            }
            this.length = this.depth
        }
        if (n !== undefined) {
            this.length = Math.min (n, this.length)
        }
    }
}

// ----------------------------------------------------------------------------
// a more elegant syntax is possible here, but native inheritance is portable

class Asks extends OrderBookSide { get side () { return false }}
class Bids extends OrderBookSide { get side () { return true }}
class CountedAsks extends CountedOrderBookSide { get side () { return false }}
class CountedBids extends CountedOrderBookSide { get side () { return true }}
class IndexedAsks extends IndexedOrderBookSide { get side () { return false }}
class IndexedBids extends IndexedOrderBookSide { get side () { return true }}

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

}
