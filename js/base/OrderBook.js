'use strict';

const { extend, deepExtend } = require ('./functions/generic.js')
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

    constructor (snapshot = {}) {

        const defaults = {
            'bids': [],
            'asks': [],
            'timestamp': undefined,
            'datetime': undefined,
            'nonce': undefined,
        }

        // merge to this
        const entries = Object.entries (extend (defaults, snapshot))
        for (let i = 0; i < entries.length; i++) {
            const [property, value] = entries[i]
            this[property] = deepExtend (this[property], value)
        }

        // wrap plain arrays with Bids/Asks classes if necessary
        if (this.asks.constructor.name === 'Array') {
            this.asks = new Asks (this.asks)
        }
        if (this.bids.constructor.name === 'Array') {
            this.bids = new Bids (this.bids)
        }
    }

    update (nonce, timestamp, asks, bids) {
        if ((nonce !== undefined) &&
            (this.nonce !== undefined) &&
            (nonce <= this.nonce)) {
            return this
        }
        this.asks.update (asks)
        this.bids.update (bids)
        this.nonce = nonce
        this.timestamp = timestamp
        this.datetime = iso8601 (timestamp)
        return this
    }
}

// ----------------------------------------------------------------------------
// overwrites absolute volumes at price levels
// or deletes price levels based on order counts (3rd value in a bidask delta)

class CountedOrderBook extends OrderBook {
    constructor (snapshot = {}) {
        super ({
            'asks': new CountedAsks (snapshot.asks || []),
            'bids': new CountedBids (snapshot.bids || []),
        })
    }
}

// ----------------------------------------------------------------------------
// indexed by order ids (3rd value in a bidask delta)

class IndexedOrderBook extends OrderBook {
    constructor (snapshot = {}) {
        super ({
            'asks': new IndexedAsks (snapshot.asks || []),
            'bids': new IndexedBids (snapshot.bids || []),
        })
    }
}

// ----------------------------------------------------------------------------
// adjusts the volumes by positive or negative relative changes or differences

class IncrementalOrderBook extends OrderBook {
    constructor (snapshot = {}) {
        super ({
            'asks': new IncrementalAsks (snapshot.asks || []),
            'bids': new IncrementalBids (snapshot.bids || []),
        })
    }
}

// ----------------------------------------------------------------------------
// incremental and indexed (2 in 1)

class IncrementalIndexedOrderBook extends OrderBook {
    constructor (snapshot = {}) {
        super ({
            'asks': new IncrementalIndexedAsks (snapshot.asks || []),
            'bids': new IncrementalIndexedBids (snapshot.bids || []),
        })
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
