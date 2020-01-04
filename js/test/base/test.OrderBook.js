'use strict';

const { OrderBook, IndexedOrderBook, CountedOrderBook, IncrementalOrderBook, IncrementalIndexedOrderBook } = require ('../../base/OrderBook');
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

const storeBid = {
    'bids': [ [ 10.0, 10 ], [ 9.1, 11 ], [ 8.2, 12 ], [ 7.3, 13 ], [ 6.4, 14 ], [ 3, 4 ] ],
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

const limitedDeletedOrderBookTarget = {
    'bids': [ [ 10.0, 10 ], [ 9.1, 11 ], [ 8.2, 12 ], [ 7.3, 13 ], [ 6.4, 14 ] ],
    'asks': [ [ 11.1, 13 ], [ 12.2, 14 ], [ 13.3, 13 ], [ 14.4, 12 ] ],
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

const limitedIndexedOrderBookTarget = {
    'bids': [ [ 10.0, 10, '1234' ], [ 9.1, 11, '1235' ], [ 8.2, 12, '1236' ], [ 7.3, 13, '1237' ], [ 6.4, 14, '1238' ] ],
    'asks': [ [ 11.1, 13, '1244' ], [ 13.3, 13, '1243' ], [ 14.4, 12, '1242' ], [ 15.5, 11, '1241' ], [ 16.6, 10, '1240' ] ],
    'timestamp': 1574827239000,
    'datetime': '2019-11-27T04:00:39.000Z',
    'nonce': 69,
};

const incrementalIndexedOrderBookTarget = {
    'bids': [ [ 10.0, 10, '1234' ], [ 9.1, 11, '1235' ], [ 8.2, 12, '1236' ], [ 7.3, 13, '1237' ], [ 6.4, 14, '1238' ], [ 4.5, 13, '1239' ] ],
    'asks': [ [ 11.1, 13, '1244' ], [ 13.3, 13, '1243' ], [ 14.4, 12, '1242' ], [ 15.5, 11, '1241' ], [ 16.6, 10, '1240' ] ],
    'timestamp': 1574827239000,
    'datetime': '2019-11-27T04:00:39.000Z',
    'nonce': 69,
};

const limitedIncrementalIndexedOrderBookTarget = {
    'bids': [ [ 10.0, 10, '1234' ], [ 9.1, 11, '1235' ], [ 8.2, 12, '1236' ], [ 7.3, 13, '1237' ], [ 6.4, 14, '1238' ] ],
    'asks': [ [ 11.1, 13, '1244' ], [ 13.3, 13, '1243' ], [ 14.4, 12, '1242' ], [ 15.5, 11, '1241' ], [ 16.6, 10, '1240' ] ],
    'timestamp': 1574827239000,
    'datetime': '2019-11-27T04:00:39.000Z',
    'nonce': 69,
};

const storedIncrementalIndexedOrderBookTarget = {
    'bids': [ [ 10.0, 13, '1234' ], [ 9.1, 11, '1235' ], [ 8.2, 12, '1236' ], [ 7.3, 13, '1237' ], [ 6.4, 14, '1238' ], [ 4.5, 13, '1239' ] ],
    'asks': [ [ 11.1, 13, '1244' ], [ 13.3, 13, '1243' ], [ 14.4, 12, '1242' ], [ 15.5, 11, '1241' ], [ 16.6, 10, '1240' ] ],
    'timestamp': 1574827239000,
    'datetime': '2019-11-27T04:00:39.000Z',
    'nonce': 69,
};

const anotherStoredIncrementalIndexedOrderBookTarget = {
    'bids': [ [ 10.2, 10, '1234' ], [ 9.1, 11, '1235' ], [ 8.2, 12, '1236' ], [ 7.3, 13, '1237' ], [ 6.4, 14, '1238' ], [ 4.5, 13, '1239' ] ],
    'asks': [ [ 11.1, 13, '1244' ], [ 13.3, 13, '1243' ], [ 14.4, 12, '1242' ], [ 15.5, 11, '1241' ], [ 16.6, 10, '1240' ] ],
    'timestamp': 1574827239000,
    'datetime': '2019-11-27T04:00:39.000Z',
    'nonce': 69,
};

const overwrite1234 = {
    'bids': [ [ 9.1, 11, '1235' ], [ 8.2, 12, '1236' ], [ 7.3, 13, '1237' ], [ 6.4, 14, '1238' ], [ 4.5, 13, '1239' ] ],
    'asks': [ [ 11.1, 13, '1244' ], [ 13.3, 13, '1243' ], [ 14.4, 12, '1242' ], [ 15.5, 11, '1241' ], [ 16.6, 10, '1240' ] ],
    'timestamp': 1574827239000,
    'datetime': '2019-11-27T04:00:39.000Z',
    'nonce': 69,
};

const overwrite1244 = {
    'bids': [ [ 10.0, 10, '1234' ], [ 9.1, 11, '1235' ], [ 8.2, 12, '1236' ], [ 7.3, 13, '1237' ], [ 6.4, 14, '1238' ], [ 4.5, 13, '1239' ] ],
    'asks': [ [ 13.3, 13, '1243' ], [ 13.5, 13, '1244' ], [ 14.4, 12, '1242' ], [ 15.5, 11, '1241' ], [ 16.6, 10, '1240' ] ],
    'timestamp': 1574827239000,
    'datetime': '2019-11-27T04:00:39.000Z',
    'nonce': 69,
};

const countedOrderBookInput = {
    'bids': [ [ 10.0, 10, 1 ], [ 9.1, 11, 1 ], [ 8.2, 12, 1 ], [ 7.3, 13, 1 ], [ 7.3, 0, 1 ], [ 6.4, 14, 5 ], [ 4.5, 13, 5 ], [ 4.5, 13, 1 ], [ 4.5, 13, 0 ] ],
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

const storedCountedOrderbookTarget = {
    'bids': [ [ 10.0, 10, 1 ], [ 9.1, 11, 1 ], [ 8.2, 12, 1 ], [ 6.4, 14, 5 ], [ 1, 1, 6 ] ],
    'asks': [ [ 11.1, 13, 12 ], [ 12.2, 14, 3 ], [ 13.3, 13, 3 ], [ 14.4, 12, 1 ], [ 15.5, 11, 1 ], [ 16.6, 10, 1 ] ],
    'timestamp': 1574827239000,
    'datetime': '2019-11-27T04:00:39.000Z',
    'nonce': 69,
};

const limitedCountedOrderBookTarget = {
    'bids': [ [ 10.0, 10, 1 ], [ 9.1, 11, 1 ], [ 8.2, 12, 1 ], [ 6.4, 14, 5 ] ],
    'asks': [ [ 11.1, 13, 12 ], [ 12.2, 14, 3 ], [ 13.3, 13, 3 ], [ 14.4, 12, 1 ], [ 15.5, 11, 1 ] ],
    'timestamp': 1574827239000,
    'datetime': '2019-11-27T04:00:39.000Z',
    'nonce': 69,
};

const incrementalOrderBookInput = {
    'bids': [ [ 10.0, 1 ], [ 10.0, 2 ], [ 9.1, 0 ], [ 8.2, 1 ], [ 7.3, 1 ], [ 6.4, 1 ] ],
    'asks': [ [ 11.1, 5 ], [ 11.1, -6 ], [ 11.1, 2 ], [ 12.2, 10 ], [ 12.2, -9.875 ], [ 12.2, 0 ], [ 13.3, 3 ], [ 14.4, 4 ], [ 15.5, 1 ], [ 16.6, 3 ] ],
    'timestamp': 1574827239000,
    'nonce': 69,
};

const incremetalOrderBookTarget = {
    'bids': [ [ 10.0, 3 ], [ 8.2, 1 ], [ 7.3, 1 ], [ 6.4, 1 ] ],
    'asks': [ [ 11.1, 2 ], [ 12.2, 0.125 ], [ 13.3, 3 ], [ 14.4, 4 ], [ 15.5, 1 ], [ 16.6, 3 ] ],
    'timestamp': 1574827239000,
    'datetime': '2019-11-27T04:00:39.000Z',
    'nonce': 69,
};

const limitedIncremetalOrderBookTarget = {
    'bids': [ [ 10.0, 3 ], [ 8.2, 1 ], [ 7.3, 1 ], [ 6.4, 1 ] ],
    'asks': [ [ 11.1, 2 ], [ 12.2, 0.125 ], [ 13.3, 3 ], [ 14.4, 4 ], [ 15.5, 1 ] ],
    'timestamp': 1574827239000,
    'datetime': '2019-11-27T04:00:39.000Z',
    'nonce': 69,
};

const storedIncremetalOrderBookTarget = {
    'bids': [ [ 10.0, 3 ], [ 8.2, 1 ], [ 7.3, 1 ], [ 6.4, 1 ], [ 3, 3 ] ],
    'asks': [ [ 11.1, 2 ], [ 12.2, 0.125 ], [ 13.3, 3 ], [ 14.4, 4 ], [ 15.5, 1 ], [ 16.6, 3 ] ],
    'timestamp': 1574827239000,
    'datetime': '2019-11-27T04:00:39.000Z',
    'nonce': 69,
};

const doubleStoredIncremetalOrderBookTarget = {
    'bids': [ [ 10.0, 3 ], [ 8.2, 1 ], [ 7.3, 1 ], [ 6.4, 1 ], [ 3, 10 ] ],
    'asks': [ [ 11.1, 2 ], [ 12.2, 0.125 ], [ 13.3, 3 ], [ 14.4, 4 ], [ 15.5, 1 ], [ 16.6, 3 ] ],
    'timestamp': 1574827239000,
    'datetime': '2019-11-27T04:00:39.000Z',
    'nonce': 69,
};


// --------------------------------------------------------------------------------------------------------------------


const orderBook = new OrderBook (orderBookInput);
const limited = new OrderBook (orderBookInput, 5);
orderBook.limit ();
assert (equals (orderBook, orderBookTarget));

orderBook.limit (5);
limited.limit ();
assert (equals (orderBook, limitedOrderBookTarget));
assert (equals (limited, limitedOrderBookTarget));
orderBook.limit ();
assert (equals (orderBook, orderBookTarget));

orderBook['bids'].store (1000, 0);
orderBook.limit ();
assert (equals (orderBook, orderBookTarget));
orderBook['bids'].store (3, 4);
orderBook.limit ();
assert (equals (orderBook, storeBid));
orderBook['bids'].store (3, 0);
orderBook.limit ();
assert (equals (orderBook, orderBookTarget));
limited['asks'].store (15.5, 0);
limited.limit ();
assert (equals (limited, limitedDeletedOrderBookTarget));

// --------------------------------------------------------------------------------------------------------------------

let indexedOrderBook = new IndexedOrderBook (indexedOrderBookInput);
const limitedIndexedOrderBook = new IndexedOrderBook (indexedOrderBookInput, 5);
indexedOrderBook.limit ();
assert (equals (indexedOrderBook, indexedOrderBookTarget));

indexedOrderBook.limit (5);
limitedIndexedOrderBook.limit ();
assert (equals (indexedOrderBook, limitedIndexedOrderBookTarget));
assert (equals (limitedIndexedOrderBook, limitedIndexedOrderBookTarget));
indexedOrderBook.limit ();
assert (equals (indexedOrderBook, indexedOrderBookTarget));

indexedOrderBook['bids'].store (1000, 0, '12345');
assert (equals (indexedOrderBook, indexedOrderBookTarget));
indexedOrderBook['bids'].store (10, 0, '1234');
indexedOrderBook.limit ();
assert (equals (indexedOrderBook, overwrite1234));
indexedOrderBook = new IndexedOrderBook (indexedOrderBookInput);
indexedOrderBook['asks'].store (13.5, 13, '1244');
indexedOrderBook.limit ();
assert (equals (indexedOrderBook, overwrite1244));

// --------------------------------------------------------------------------------------------------------------------

const countedOrderBook = new CountedOrderBook (countedOrderBookInput);
const limitedCountedOrderBook = new CountedOrderBook (countedOrderBookInput, 5);
countedOrderBook.limit ();
assert (equals (countedOrderBook, countedOrderBookTarget));

countedOrderBook.limit (5);
limitedCountedOrderBook.limit ();
assert (equals (countedOrderBook, limitedCountedOrderBookTarget));
assert (equals (limitedCountedOrderBook, limitedCountedOrderBookTarget));
countedOrderBook.limit ();
assert (equals (countedOrderBook, countedOrderBookTarget));

countedOrderBook['bids'].store (5, 0, 6);
countedOrderBook.limit ();
assert (equals (countedOrderBook, countedOrderBookTarget));
countedOrderBook['bids'].store (1, 1, 6);
countedOrderBook.limit ();
assert (equals (countedOrderBook, storedCountedOrderbookTarget));

// --------------------------------------------------------------------------------------------------------------------

const incrementalOrderBook = new IncrementalOrderBook (incrementalOrderBookInput);
const limitedIncrementalOrderBook = new IncrementalOrderBook (incrementalOrderBookInput, 5);
incrementalOrderBook.limit ();
assert (equals (incrementalOrderBook, incremetalOrderBookTarget));

incrementalOrderBook.limit (5);
limitedIncrementalOrderBook.limit ();
assert (equals (incrementalOrderBook, limitedIncremetalOrderBookTarget));
assert (equals (limitedIncrementalOrderBook, limitedIncremetalOrderBookTarget));
incrementalOrderBook.limit ();
assert (equals (incrementalOrderBook, incremetalOrderBookTarget));

incrementalOrderBook['bids'].store (3, 3);
incrementalOrderBook.limit ();
assert (equals (incrementalOrderBook, storedIncremetalOrderBookTarget));
incrementalOrderBook['bids'].store (3, 7);
incrementalOrderBook.limit ();
assert (equals (incrementalOrderBook, doubleStoredIncremetalOrderBookTarget));
incrementalOrderBook['bids'].store (17, 0);
assert (equals (incrementalOrderBook, doubleStoredIncremetalOrderBookTarget));

// --------------------------------------------------------------------------------------------------------------------


let incrementalIndexedOrderBook = new IncrementalIndexedOrderBook (indexedOrderBookInput);
const limitedIncrementalIndexedOrderBook = new IncrementalIndexedOrderBook (indexedOrderBookInput, 5);
incrementalIndexedOrderBook.limit ();
assert (equals (incrementalIndexedOrderBook, incrementalIndexedOrderBookTarget));

incrementalIndexedOrderBook.limit (5);
limitedIncrementalIndexedOrderBook.limit ();
assert (equals (incrementalIndexedOrderBook, limitedIncrementalIndexedOrderBookTarget));
assert (equals (limitedIncrementalIndexedOrderBook, limitedIncrementalIndexedOrderBookTarget));
incrementalIndexedOrderBook.limit ();
assert (equals (incrementalIndexedOrderBook, incrementalIndexedOrderBookTarget));

incrementalIndexedOrderBook['bids'].store (5, -1, 'xxyy');
incrementalIndexedOrderBook.limit ();
assert (equals (incrementalIndexedOrderBook, incrementalIndexedOrderBookTarget));
incrementalIndexedOrderBook['bids'].store (10.0, 3, '1234');  // price does match merge size
incrementalIndexedOrderBook.limit ();
assert (equals (incrementalIndexedOrderBook, storedIncrementalIndexedOrderBookTarget));
incrementalIndexedOrderBook = new IncrementalIndexedOrderBook (indexedOrderBookInput);
incrementalIndexedOrderBook['bids'].store (10.2, 10, '1234');  // price does not match overwrite size
incrementalIndexedOrderBook.limit ();
assert (equals (incrementalIndexedOrderBook, anotherStoredIncrementalIndexedOrderBookTarget));
