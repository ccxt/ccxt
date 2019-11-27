'use strict';

const { OrderBook, LimitedOrderBook, IndexedOrderBook, CountedOrderBook } = require ('../../base/OrderBook');
const assert = require ('assert');

function equals (a, b) {
    if (a.length !== b.length) {
        return false
    }
    for (const prop in a) {
        if (Array.isArray (a[prop])) {
            return equals (a[prop], b[prop])
        }
        if (a[prop] !== b[prop]) {
            return false
        }
    }
    return true
}

const input = {
    'bids': [[10, 10], [9, 11], [8, 12], [6, 13], [5, 14], [4, 13]],
    'asks': [[10, 10], [9, 11], [8, 12], [6, 13], [5, 14], [4, 13]],
    'timestamp': 1574827239000,
    'nonce': 69,
};

let target = {
    'bids': [[10, 10], [9, 11], [8, 12], [6, 13], [5, 14], [4, 13]],
    'asks': [[4, 13], [5, 14], [6, 13], [8, 12], [9, 11], [10, 10]],
    'timestamp': 1574827239000,
    'datetime': '2019-11-27T04:00:39.000Z',
    'nonce': 69,
};


const x = new OrderBook (input);

x.limit ();

assert (equals (x, target));

x.limit (5);

target = {
    'bids': [[10, 10], [9, 11], [8, 12], [6, 13], [5, 14]],
    'asks': [[4, 13], [5, 14], [6, 13], [8, 12], [9, 11]],
    'timestamp': 1574827239000,
    'nonce': 69,
};
