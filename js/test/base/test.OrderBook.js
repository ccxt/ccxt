'use strict';

const { OrderBook, LimitedOrderBook, IndexedOrderBook, CountedOrderBook, IncrementalOrderBook } = require ('../../base/OrderBook');
const assert = require ('assert');

function equals (a, b) {
    if (a.length !== b.length) {
        return false
    }
    for (const prop in a) {
        if (Array.isArray (a[prop])) {
            if (!equals (a[prop], b[prop])) {
                return false
            }
        }
        else if (a[prop] !== b[prop]) {
            return false
        }
    }
    return true
}

// --------------------------------------------------------------------------------------------------------------------

const orderBookInput = {
    'bids': [ [ 10.0, 10 ], [ 9.1, 11 ], [ 8.2, 12 ], [ 7.3, 13 ], [ 6.4, 14 ], [ 4.5, 13 ], [ 4.5, 0 ] ],
    'asks': [ [ 16.6, 10 ], [ 15.5, 11 ], [ 14.4, 12 ], [ 13.3, 13 ], [ 12.2, 14 ], [ 11.1, 13 ] ],
    'timestamp': 1574827239000,
    'nonce': 69,
};

const orderBookTarget = {
    'bids': [ [ 10.0, 10 ], [ 9.1, 11 ], [ 8.2, 12 ], [ 7.3, 13 ], [ 6.4, 14 ] ],
    'asks': [ [ 11.1, 13 ], [ 12.2, 14 ], [ 13.3, 13 ], [ 14.4, 12 ], [ 15.5, 11 ], [ 16.6, 10 ] ],
    'timestamp': 1574827239000,
    'datetime': '2019-11-27T04:00:39.000Z',
    'nonce': 69,
};

const limitedOrderBookTarget = {
    'bids': [ [ 10.0, 10 ], [ 9.1, 11 ], [ 8.2, 12 ], [ 7.3, 13 ], [ 6.4, 14 ] ],
    'asks': [ [ 11.1, 13 ], [ 12.2, 14 ], [ 13.3, 13 ], [ 14.4, 12 ], [ 15.5, 11 ] ],
    'timestamp': 1574827239000,
    'datetime': '2019-11-27T04:00:39.000Z',
    'nonce': 69,
};

const indexedOrderBookInput = {
    'bids': [ [ 10.0, 10, '1234' ], [ 9.1, 11, '1235' ], [ 8.2, 12, '1236' ], [ 7.3, 13, '1237' ], [ 6.4, 14, '1238' ], [ 4.5, 13, '1239' ] ],
    'asks': [ [ 16.6, 10, '1240' ], [ 15.5, 11, '1241' ], [ 14.4, 12, '1242' ], [ 13.3, 13, '1243' ], [ 12.2, 14, '1244' ], [ 11.1, 13, '1244' ] ],
    'timestamp': 1574827239000,
    'nonce': 69,
};

const indexedOrderBookTarget = {
    'bids': [ [ 10.0, 10, '1234' ], [ 9.1, 11, '1235' ], [ 8.2, 12, '1236' ], [ 7.3, 13, '1237' ], [ 6.4, 14, '1238' ], [ 4.5, 13, '1239' ] ],
    'asks': [ [ 11.1, 13, '1244' ], [ 13.3, 13, '1243' ], [ 14.4, 12, '1242' ], [ 15.5, 11, '1241' ], [ 16.6, 10, '1240' ] ],
    'timestamp': 1574827239000,
    'datetime': '2019-11-27T04:00:39.000Z',
    'nonce': 69,
};

const countedOrderBookInput = {
    'bids': [ [ 10.0, 10, 1 ], [ 9.1, 11, 1 ], [ 8.2, 12, 1 ], [ 7.3, 13, 1 ], [ 7.3, 0, 1 ], [ 6.4, 14, 5 ], [ 4.5, 13, 5 ], [ 4.5, 13, 0 ] ],
    'asks': [ [ 16.6, 10, 1 ], [ 15.5, 11, 1 ], [ 14.4, 12, 1 ], [ 13.3, 13, 3 ], [ 12.2, 14, 3 ], [ 11.1, 13, 3 ], [ 11.1, 13, 12 ] ],
    'timestamp': 1574827239000,
    'nonce': 69,
};

const countedOrderBookTarget = {
    'bids': [ [ 10.0, 10, 1 ], [ 9.1, 11, 1 ], [ 8.2, 12, 1 ], [ 6.4, 14, 5 ] ],
    'asks': [ [ 11.1, 13, 12 ], [ 12.2, 14, 3 ], [ 13.3, 13, 3 ], [ 14.4, 12, 1 ], [ 15.5, 11, 1 ], [ 16.6, 10, 1 ] ],
    'timestamp': 1574827239000,
    'datetime': '2019-11-27T04:00:39.000Z',
    'nonce': 69,
};

const incrementalOrderBookInput = {
    'bids': [ [ 10.0, 1 ], [ 10.0, 2 ], [ 9.1, 0 ], [ 8.2, 1 ], [ 7.3, 1 ], [ 6.4, 1 ] ],
    'asks': [ [ 11.1, 5 ], [ 11.1, -6 ], [ 11.1, 2 ], [ 12.2, 10 ], [ 12.2, -9.875 ], [ 12.2, 0 ], [ 13.3, 3 ], [ 14.4, 4 ] ],
    'timestamp': 1574827239000,
    'nonce': 69,
};

const incremetalOrderBookTarget = {
    'bids': [ [ 10.0, 3 ], [ 8.2, 1 ], [ 7.3, 1 ], [ 6.4, 1 ] ],
    'asks': [ [ 11.1, 2 ], [ 12.2, 0.125 ], [ 13.3, 3 ], [ 14.4, 4 ] ],
    'timestamp': 1574827239000,
    'datetime': '2019-11-27T04:00:39.000Z',
    'nonce': 69,
};

// --------------------------------------------------------------------------------------------------------------------

const orderBook = new OrderBook (orderBookInput);
orderBook.limit ();
const limitedOrderBook = new LimitedOrderBook (orderBookInput, 5);
limitedOrderBook.limit ();
const indexedOrderBook = new IndexedOrderBook (indexedOrderBookInput);
indexedOrderBook.limit ();
const countedOrderBook = new CountedOrderBook (countedOrderBookInput);
countedOrderBook.limit ();
const incrementalOrderBook = new IncrementalOrderBook (incrementalOrderBookInput);
incrementalOrderBook.limit ();

assert (equals (orderBook, orderBookTarget));
assert (equals (limitedOrderBook, limitedOrderBookTarget));
assert (equals (indexedOrderBook, indexedOrderBookTarget));
assert (equals (countedOrderBook, countedOrderBookTarget));
assert (equals (incrementalOrderBook, incremetalOrderBookTarget));
