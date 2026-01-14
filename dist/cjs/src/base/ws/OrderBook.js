'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var time = require('../functions/time.js');
var generic = require('../functions/generic.js');
var OrderBookSide = require('./OrderBookSide.js');

/* eslint-disable max-classes-per-file */
class OrderBook {
    constructor(snapshot = {}, depth = undefined) {
        this.cache = []; // make prop visible so we use typed OrderBooks
        Object.defineProperty(this, 'cache', {
            __proto__: null,
            value: [],
            writable: true,
            enumerable: false,
        });
        depth = depth || Number.MAX_SAFE_INTEGER;
        const defaults = {
            'bids': [],
            'asks': [],
            'timestamp': undefined,
            'datetime': undefined,
            'nonce': undefined,
            'symbol': undefined,
        };
        // merge to this
        const entries = Object.entries(generic.extend(defaults, snapshot));
        for (let i = 0; i < entries.length; i++) {
            const [property, value] = entries[i];
            this[property] = value;
        }
        // wrap plain arrays with Bids/Asks classes if necessary
        if (this.asks.constructor.name === 'Array') {
            this.asks = new OrderBookSide.Asks(this.asks, depth);
        }
        if (this.bids.constructor.name === 'Array') {
            this.bids = new OrderBookSide.Bids(this.bids, depth);
        }
        if (this.timestamp) {
            this.datetime = time.iso8601(this.timestamp);
        }
    }
    limit() {
        this.asks.limit();
        this.bids.limit();
        return this;
    }
    update(snapshot) {
        if ((snapshot.nonce !== undefined) &&
            (this.nonce !== undefined) &&
            (snapshot.nonce <= this.nonce)) {
            return this;
        }
        this.nonce = snapshot.nonce;
        this.timestamp = snapshot.timestamp;
        this.datetime = time.iso8601(this.timestamp);
        return this.reset(snapshot);
    }
    reset(snapshot = {}) {
        this.asks.index.fill(Number.MAX_VALUE);
        this.asks.length = 0;
        if (snapshot.asks) {
            for (let i = 0; i < snapshot.asks.length; i++) {
                this.asks.storeArray(snapshot.asks[i]);
            }
        }
        this.bids.index.fill(Number.MAX_VALUE);
        this.bids.length = 0;
        if (snapshot.bids) {
            for (let i = 0; i < snapshot.bids.length; i++) {
                this.bids.storeArray(snapshot.bids[i]);
            }
        }
        this.nonce = snapshot.nonce;
        this.timestamp = snapshot.timestamp;
        this.datetime = time.iso8601(this.timestamp);
        this.symbol = snapshot.symbol;
        return this;
    }
}
// ----------------------------------------------------------------------------
// overwrites absolute volumes at price levels
// or deletes price levels based on order counts (3rd value in a bidask delta)
class CountedOrderBook extends OrderBook {
    constructor(snapshot = {}, depth = undefined) {
        super(generic.extend(snapshot, {
            'asks': new OrderBookSide.CountedAsks(snapshot.asks || [], depth),
            'bids': new OrderBookSide.CountedBids(snapshot.bids || [], depth),
        }));
    }
}
// ----------------------------------------------------------------------------
// indexed by order ids (3rd value in a bidask delta)
class IndexedOrderBook extends OrderBook {
    constructor(snapshot = {}, depth = undefined) {
        super(generic.extend(snapshot, {
            'asks': new OrderBookSide.IndexedAsks(snapshot.asks || [], depth),
            'bids': new OrderBookSide.IndexedBids(snapshot.bids || [], depth),
        }));
    }
}

exports.CountedOrderBook = CountedOrderBook;
exports.IndexedOrderBook = IndexedOrderBook;
exports.OrderBook = OrderBook;
