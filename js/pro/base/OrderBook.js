/* eslint-disable max-classes-per-file */

'use strict';

const { iso8601 } = require ("../../base/functions/time")
const { extend, deepExtend } = require ('../../base/functions/generic.js')
    , {
        Asks,
        Bids,
        CountedAsks,
        CountedBids,
        IndexedAsks,
        IndexedBids,
        IncrementalAsks,
        IncrementalBids,
        IncrementalIndexedAsks,
        IncrementalIndexedBids,
    } = require ('./OrderBookSide')

// ----------------------------------------------------------------------------
// overwrites absolute volumes at price levels

class OrderBook {

    constructor (snapshot = {}, depth = undefined) {

        Object.defineProperty (this, 'cache', {
            __proto__: null, // make it invisible
            value: [],
            writable: true,
        })

        depth = depth || Number.MAX_SAFE_INTEGER

        const defaults = {
            'bids': [],
            'asks': [],
            'timestamp': undefined,
            'datetime': undefined,
            'nonce': undefined,
            'symbol': undefined,
        }

        // merge to this
        const entries = Object.entries (extend (defaults, snapshot))
        for (let i = 0; i < entries.length; i++) {
            const [ property, value ] = entries[i]
            this[property] = value
        }

        // wrap plain arrays with Bids/Asks classes if necessary
        if (this.asks.constructor.name === 'Array') {
            this.asks = new Asks (this.asks, depth)
        }
        if (this.bids.constructor.name === 'Array') {
            this.bids = new Bids (this.bids, depth)
        }
        if (this.timestamp) {
            this.datetime = iso8601 (this.timestamp)
        }
    }

    limit () {
        this.asks.limit ()
        this.bids.limit ()
        return this
    }

    update (snapshot) {
        if ((snapshot.nonce !== undefined) &&
            (this.nonce !== undefined) &&
            (snapshot.nonce <= this.nonce)) {
            return this
        }
        this.nonce = snapshot.nonce
        this.timestamp = snapshot.timestamp
        this.datetime = iso8601 (this.timestamp)
        return this.reset (snapshot)
    }

    reset (snapshot = {}) {
        this.asks.index.fill (Number.MAX_VALUE)
        this.asks.length = 0
        if (snapshot.asks) {
            for (let i = 0; i < snapshot.asks.length; i++) {
                this.asks.storeArray (snapshot.asks[i])
            }
        }
        this.bids.index.fill (Number.MAX_VALUE)
        this.bids.length = 0
        if (snapshot.bids) {
            for (let i = 0; i < snapshot.bids.length; i++) {
                this.bids.storeArray (snapshot.bids[i])
            }
        }
        this.nonce = snapshot.nonce
        this.timestamp = snapshot.timestamp
        this.datetime = iso8601 (this.timestamp)
        this.symbol = snapshot.symbol
        return this
    }
}

// ----------------------------------------------------------------------------
// overwrites absolute volumes at price levels
// or deletes price levels based on order counts (3rd value in a bidask delta)

class CountedOrderBook extends OrderBook {
    constructor (snapshot = {}, depth = undefined) {
        super (extend (snapshot, {
            'asks': new CountedAsks (snapshot.asks || [], depth),
            'bids': new CountedBids (snapshot.bids || [], depth),
        }))
    }
}

// ----------------------------------------------------------------------------
// indexed by order ids (3rd value in a bidask delta)

class IndexedOrderBook extends OrderBook {
    constructor (snapshot = {}, depth = undefined) {
        super (extend (snapshot, {
            'asks': new IndexedAsks (snapshot.asks || [], depth),
            'bids': new IndexedBids (snapshot.bids || [], depth),
        }))
    }
}

// ----------------------------------------------------------------------------
// adjusts the volumes by positive or negative relative changes or differences

class IncrementalOrderBook extends OrderBook {
    constructor (snapshot = {}, depth = undefined) {
        super (extend (snapshot, {
            'asks': new IncrementalAsks (snapshot.asks || [], depth),
            'bids': new IncrementalBids (snapshot.bids || [], depth),
        }))
    }
}


// ----------------------------------------------------------------------------
// incremental and indexed (2 in 1)

class IncrementalIndexedOrderBook extends OrderBook {
    constructor (snapshot = {}, depth = undefined) {
        super (extend (snapshot, {
            'asks': new IncrementalIndexedAsks (snapshot.asks || [], depth),
            'bids': new IncrementalIndexedBids (snapshot.bids || [], depth),
        }))
    }
}

// ----------------------------------------------------------------------------

module.exports = {
    OrderBook,
    CountedOrderBook,
    IndexedOrderBook,
    IncrementalOrderBook,
    IncrementalIndexedOrderBook,
}
