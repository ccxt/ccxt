'use strict';

const { extend, deepExtend } = require ('ccxt/js/base/functions/generic.js')
    , {
        Asks,
        Bids,
        LimitedAsks,
        LimitedBids,
        CountedAsks,
        CountedBids,
        IndexedAsks,
        IndexedBids,
        IncrementalAsks,
        IncrementalBids,
        LimitedIndexedAsks,
        LimitedIndexedBids,
        LimitedCountedAsks,
        LimitedCountedBids,
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
            //  not sure why deepExtend is necessary here
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

    limit (n = undefined) {
        this.asks.limit (n)
        this.bids.limit (n)
        return this
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
// some exchanges limit the number of bids/asks in the aggregated orderbook
// orders beyond the limit threshold are not updated with new ws deltas
// those orders should not be returned to the user, they are outdated quickly

class LimitedOrderBook extends OrderBook {
    constructor (snapshot = {}, depth = undefined) {
        super ({
            'asks': new LimitedAsks (snapshot.asks || [], depth),
            'bids': new LimitedBids (snapshot.bids || [], depth),
        })
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
// limited and indexed (2 in 1)

class LimitedIndexedOrderBook extends OrderBook {
    constructor (snapshot = {}, depth = undefined) {
        super ({
            'asks': new LimitedIndexedAsks (snapshot.asks || [], depth),
            'bids': new LimitedIndexedBids (snapshot.bids || [], depth),
        })
    }
}

// ----------------------------------------------------------------------------
// limited and indexed (2 in 1)

class LimitedCountedOrderBook extends OrderBook {
    constructor (snapshot = {}, depth = undefined) {
        super ({
            'asks': new LimitedCountedAsks (snapshot.asks || [], depth),
            'bids': new LimitedCountedBids (snapshot.bids || [], depth),
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
    LimitedOrderBook,
    CountedOrderBook,
    IndexedOrderBook,
    IncrementalOrderBook,
    LimitedIndexedOrderBook,
    LimitedCountedOrderBook,
    IncrementalIndexedOrderBook,
}
