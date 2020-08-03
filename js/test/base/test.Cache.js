'use strict';

const { ArrayCache, ArrayCacheBySymbolById } = require ('../../base/Cache')
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

// ----------------------------------------------------------------------------

let cache = new ArrayCache (3);

cache.append (1);
cache.append (2);
cache.append (3);
cache.append (4);

assert (equals (cache, [2, 3, 4]));

cache.append (5);
cache.append (6);
cache.append (7);
cache.append (8);

assert (equals (cache, [6, 7, 8]));

cache.clear ();

assert (equals (cache, []));

cache.append (1);

assert (equals (cache, [1]));

// ----------------------------------------------------------------------------

cache = new ArrayCache (1);

cache.append (1);
cache.append (2);

assert (equals (cache, [2]));

// ----------------------------------------------------------------------------

cache = new ArrayCacheBySymbolById ();

const object1 = { 'symbol': 'BTC/USDT', 'id': 'abcdef', 'i': 1 };
const object2 = { 'symbol': 'ETH/USDT', 'id': 'qwerty', 'i': 2 };
const object3 = { 'symbol': 'BTC/USDT', 'id': 'abcdef', 'i': 3 };

cache.append (object1);
cache.append (object2);
cache.append (object3); // should update index 0

assert (equals (cache, [ object3, object2 ]));
