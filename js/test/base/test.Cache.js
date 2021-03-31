'use strict';

const assert = require ('assert');
const { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById } = require ('../../base/Cache');

function equals (a, b) {
    if (a.length !== b.length) {
        return false;
    }
    for (const prop in a) {
        if (Array.isArray (a[prop]) || typeof a[prop] === 'object') {
            if (!equals (a[prop], b[prop])) {
                return false;
            }
        } else if (a[prop] !== b[prop]) {
            return false;
        }
    }
    return true;
}

// ----------------------------------------------------------------------------

let cache = new ArrayCache (3);

cache.append ({ 'symbol': 'BTC/USDT', 'data': 1 });
cache.append ({ 'symbol': 'BTC/USDT', 'data': 2 });
cache.append ({ 'symbol': 'BTC/USDT', 'data': 3 });
cache.append ({ 'symbol': 'BTC/USDT', 'data': 4 });

assert (equals (cache, [
    { 'symbol': 'BTC/USDT', 'data': 2 },
    { 'symbol': 'BTC/USDT', 'data': 3 },
    { 'symbol': 'BTC/USDT', 'data': 4 },
]));

cache.append ({ 'symbol': 'BTC/USDT', 'data': 5 });
cache.append ({ 'symbol': 'BTC/USDT', 'data': 6 });
cache.append ({ 'symbol': 'BTC/USDT', 'data': 7 });
cache.append ({ 'symbol': 'BTC/USDT', 'data': 8 });

assert (equals (cache, [
    { 'symbol': 'BTC/USDT', 'data': 6 },
    { 'symbol': 'BTC/USDT', 'data': 7 },
    { 'symbol': 'BTC/USDT', 'data': 8 },
]));

cache.clear ();

cache.append ({ 'symbol': 'BTC/USDT', 'data': 1 });

assert (equals (cache, [
    { 'symbol': 'BTC/USDT', 'data': 1 },
]));

// ----------------------------------------------------------------------------

cache = new ArrayCache (1);

cache.append ({ 'symbol': 'BTC/USDT', 'data': 1 });
cache.append ({ 'symbol': 'BTC/USDT', 'data': 2 });

assert (equals (cache, [
    { 'symbol': 'BTC/USDT', 'data': 2 },
]));

// ----------------------------------------------------------------------------

cache = new ArrayCacheByTimestamp ();

const ohlcv1 = [100, 1, 2, 3];
const ohlcv2 = [200, 5, 6, 7];
cache.append (ohlcv1);
cache.append (ohlcv2);

assert (equals (cache, [ohlcv1, ohlcv2]));

const modify2 = [200, 10, 11, 12];
cache.append (modify2);

assert (equals (cache, [ohlcv1, modify2]));

// ----------------------------------------------------------------------------

cache = new ArrayCacheBySymbolById ();

const object1 = { 'symbol': 'BTC/USDT', 'id': 'abcdef', 'i': 1 };
const object2 = { 'symbol': 'ETH/USDT', 'id': 'qwerty', 'i': 2 };
const object3 = { 'symbol': 'BTC/USDT', 'id': 'abcdef', 'i': 3 };
cache.append (object1);
cache.append (object2);
cache.append (object3); // should update index 0

assert (equals (cache, [ object2, object3 ]));

cache = new ArrayCacheBySymbolById (5);

for (let i = 1; i < 11; i++) {
    cache.append ({
        'symbol': 'BTC/USDT',
        'id': i.toString (),
        'i': i,
    });
}

assert (equals (cache, [
    { 'symbol': 'BTC/USDT', 'id': '6', 'i': 6 },
    { 'symbol': 'BTC/USDT', 'id': '7', 'i': 7 },
    { 'symbol': 'BTC/USDT', 'id': '8', 'i': 8 },
    { 'symbol': 'BTC/USDT', 'id': '9', 'i': 9 },
    { 'symbol': 'BTC/USDT', 'id': '10', 'i': 10 },
]));

for (let i = 1; i < 11; i++) {
    cache.append ({
        'symbol': 'BTC/USDT',
        'id': i.toString (),
        'i': i + 10,
    });
}

assert (equals (cache, [
    { 'symbol': 'BTC/USDT', 'id': '6', 'i': 16 },
    { 'symbol': 'BTC/USDT', 'id': '7', 'i': 17 },
    { 'symbol': 'BTC/USDT', 'id': '8', 'i': 18 },
    { 'symbol': 'BTC/USDT', 'id': '9', 'i': 19 },
    { 'symbol': 'BTC/USDT', 'id': '10', 'i': 20 },
]));

const middle = { 'symbol': 'BTC/USDT', 'id': '8', 'i': 28 };
cache.append (middle);

assert (equals (cache, [
    { 'symbol': 'BTC/USDT', 'id': '6', 'i': 16 },
    { 'symbol': 'BTC/USDT', 'id': '7', 'i': 17 },
    { 'symbol': 'BTC/USDT', 'id': '9', 'i': 19 },
    { 'symbol': 'BTC/USDT', 'id': '10', 'i': 20 },
    { 'symbol': 'BTC/USDT', 'id': '8', 'i': 28 },
]));

const otherMiddle = { 'symbol': 'BTC/USDT', 'id': '7', 'i': 27 };
cache.append (otherMiddle);

assert (equals (cache, [
    { 'symbol': 'BTC/USDT', 'id': '6', 'i': 16 },
    { 'symbol': 'BTC/USDT', 'id': '9', 'i': 19 },
    { 'symbol': 'BTC/USDT', 'id': '10', 'i': 20 },
    { 'symbol': 'BTC/USDT', 'id': '8', 'i': 28 },
    { 'symbol': 'BTC/USDT', 'id': '7', 'i': 27 },
]));

for (let i = 30; i < 33; i++) {
    cache.append ({
        'symbol': 'BTC/USDT',
        'id': i.toString (),
        'i': i + 10,
    });
}

assert (equals (cache, [
    { 'symbol': 'BTC/USDT', 'id': '8', 'i': 28 },
    { 'symbol': 'BTC/USDT', 'id': '7', 'i': 27 },
    { 'symbol': 'BTC/USDT', 'id': '30', 'i': 40 },
    { 'symbol': 'BTC/USDT', 'id': '31', 'i': 41 },
    { 'symbol': 'BTC/USDT', 'id': '32', 'i': 42 } ]));

const first = { 'symbol': 'BTC/USDT', 'id': '8', 'i': 38 };
cache.append (first);

assert (equals (cache, [
    { 'symbol': 'BTC/USDT', 'id': '7', 'i': 27 },
    { 'symbol': 'BTC/USDT', 'id': '30', 'i': 40 },
    { 'symbol': 'BTC/USDT', 'id': '31', 'i': 41 },
    { 'symbol': 'BTC/USDT', 'id': '32', 'i': 42 },
    { 'symbol': 'BTC/USDT', 'id': '8', 'i': 38 },
]));

const another = { 'symbol': 'BTC/USDT', 'id': '30', 'i': 50 };
cache.append (another);

assert (equals (cache, [
    { 'symbol': 'BTC/USDT', 'id': '7', 'i': 27 },
    { 'symbol': 'BTC/USDT', 'id': '31', 'i': 41 },
    { 'symbol': 'BTC/USDT', 'id': '32', 'i': 42 },
    { 'symbol': 'BTC/USDT', 'id': '8', 'i': 38 },
    { 'symbol': 'BTC/USDT', 'id': '30', 'i': 50 },
]));
