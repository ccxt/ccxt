import assert from 'assert';
import { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById } from '../../../base/ws/Cache.js';
function equals(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    for (const prop in a) {
        if (Array.isArray(a[prop]) || typeof a[prop] === 'object') {
            if (!equals(a[prop], b[prop])) {
                return false;
            }
        }
        else if (a[prop] !== b[prop]) {
            return false;
        }
    }
    return true;
}
// ----------------------------------------------------------------------------
let cache = new ArrayCache(3);
cache.append({ 'symbol': 'BTC/USDT', 'data': 1 });
cache.append({ 'symbol': 'BTC/USDT', 'data': 2 });
cache.append({ 'symbol': 'BTC/USDT', 'data': 3 });
cache.append({ 'symbol': 'BTC/USDT', 'data': 4 });
assert(equals(cache, [
    { 'symbol': 'BTC/USDT', 'data': 2 },
    { 'symbol': 'BTC/USDT', 'data': 3 },
    { 'symbol': 'BTC/USDT', 'data': 4 },
]));
cache.append({ 'symbol': 'BTC/USDT', 'data': 5 });
cache.append({ 'symbol': 'BTC/USDT', 'data': 6 });
cache.append({ 'symbol': 'BTC/USDT', 'data': 7 });
cache.append({ 'symbol': 'BTC/USDT', 'data': 8 });
assert(equals(cache, [
    { 'symbol': 'BTC/USDT', 'data': 6 },
    { 'symbol': 'BTC/USDT', 'data': 7 },
    { 'symbol': 'BTC/USDT', 'data': 8 },
]));
cache.clear();
cache.append({ 'symbol': 'BTC/USDT', 'data': 1 });
assert(equals(cache, [
    { 'symbol': 'BTC/USDT', 'data': 1 },
]));
// ----------------------------------------------------------------------------
cache = new ArrayCache(1);
cache.append({ 'symbol': 'BTC/USDT', 'data': 1 });
cache.append({ 'symbol': 'BTC/USDT', 'data': 2 });
assert(equals(cache, [
    { 'symbol': 'BTC/USDT', 'data': 2 },
]));
// ----------------------------------------------------------------------------
cache = new ArrayCacheByTimestamp();
const ohlcv1 = [100, 1, 2, 3];
const ohlcv2 = [200, 5, 6, 7];
cache.append(ohlcv1);
cache.append(ohlcv2);
assert(equals(cache, [ohlcv1, ohlcv2]));
const modify2 = [200, 10, 11, 12];
cache.append(modify2);
assert(equals(cache, [ohlcv1, modify2]));
// ----------------------------------------------------------------------------
cache = new ArrayCacheBySymbolById();
const object1 = { 'symbol': 'BTC/USDT', 'id': 'abcdef', 'i': 1 };
const object2 = { 'symbol': 'ETH/USDT', 'id': 'qwerty', 'i': 2 };
const object3 = { 'symbol': 'BTC/USDT', 'id': 'abcdef', 'i': 3 };
cache.append(object1);
cache.append(object2);
cache.append(object3); // should update index 0
assert(equals(cache, [object2, object3]));
cache = new ArrayCacheBySymbolById(5);
for (let i = 1; i < 11; i++) {
    cache.append({
        'symbol': 'BTC/USDT',
        'id': i.toString(),
        'i': i,
    });
}
assert(equals(cache, [
    { 'symbol': 'BTC/USDT', 'id': '6', 'i': 6 },
    { 'symbol': 'BTC/USDT', 'id': '7', 'i': 7 },
    { 'symbol': 'BTC/USDT', 'id': '8', 'i': 8 },
    { 'symbol': 'BTC/USDT', 'id': '9', 'i': 9 },
    { 'symbol': 'BTC/USDT', 'id': '10', 'i': 10 },
]));
for (let i = 1; i < 11; i++) {
    cache.append({
        'symbol': 'BTC/USDT',
        'id': i.toString(),
        'i': i + 10,
    });
}
assert(equals(cache, [
    { 'symbol': 'BTC/USDT', 'id': '6', 'i': 16 },
    { 'symbol': 'BTC/USDT', 'id': '7', 'i': 17 },
    { 'symbol': 'BTC/USDT', 'id': '8', 'i': 18 },
    { 'symbol': 'BTC/USDT', 'id': '9', 'i': 19 },
    { 'symbol': 'BTC/USDT', 'id': '10', 'i': 20 },
]));
const middle = { 'symbol': 'BTC/USDT', 'id': '8', 'i': 28 };
cache.append(middle);
assert(equals(cache, [
    { 'symbol': 'BTC/USDT', 'id': '6', 'i': 16 },
    { 'symbol': 'BTC/USDT', 'id': '7', 'i': 17 },
    { 'symbol': 'BTC/USDT', 'id': '9', 'i': 19 },
    { 'symbol': 'BTC/USDT', 'id': '10', 'i': 20 },
    { 'symbol': 'BTC/USDT', 'id': '8', 'i': 28 },
]));
const otherMiddle = { 'symbol': 'BTC/USDT', 'id': '7', 'i': 27 };
cache.append(otherMiddle);
assert(equals(cache, [
    { 'symbol': 'BTC/USDT', 'id': '6', 'i': 16 },
    { 'symbol': 'BTC/USDT', 'id': '9', 'i': 19 },
    { 'symbol': 'BTC/USDT', 'id': '10', 'i': 20 },
    { 'symbol': 'BTC/USDT', 'id': '8', 'i': 28 },
    { 'symbol': 'BTC/USDT', 'id': '7', 'i': 27 },
]));
for (let i = 30; i < 33; i++) {
    cache.append({
        'symbol': 'BTC/USDT',
        'id': i.toString(),
        'i': i + 10,
    });
}
assert(equals(cache, [
    { 'symbol': 'BTC/USDT', 'id': '8', 'i': 28 },
    { 'symbol': 'BTC/USDT', 'id': '7', 'i': 27 },
    { 'symbol': 'BTC/USDT', 'id': '30', 'i': 40 },
    { 'symbol': 'BTC/USDT', 'id': '31', 'i': 41 },
    { 'symbol': 'BTC/USDT', 'id': '32', 'i': 42 }
]));
const first = { 'symbol': 'BTC/USDT', 'id': '8', 'i': 38 };
cache.append(first);
assert(equals(cache, [
    { 'symbol': 'BTC/USDT', 'id': '7', 'i': 27 },
    { 'symbol': 'BTC/USDT', 'id': '30', 'i': 40 },
    { 'symbol': 'BTC/USDT', 'id': '31', 'i': 41 },
    { 'symbol': 'BTC/USDT', 'id': '32', 'i': 42 },
    { 'symbol': 'BTC/USDT', 'id': '8', 'i': 38 },
]));
const another = { 'symbol': 'BTC/USDT', 'id': '30', 'i': 50 };
cache.append(another);
assert(equals(cache, [
    { 'symbol': 'BTC/USDT', 'id': '7', 'i': 27 },
    { 'symbol': 'BTC/USDT', 'id': '31', 'i': 41 },
    { 'symbol': 'BTC/USDT', 'id': '32', 'i': 42 },
    { 'symbol': 'BTC/USDT', 'id': '8', 'i': 38 },
    { 'symbol': 'BTC/USDT', 'id': '30', 'i': 50 },
]));
// ----------------------------------------------------------------------------
// test ArrayCacheBySymbolById limit with symbol set
let symbol = 'BTC/USDT';
cache = new ArrayCacheBySymbolById();
let initialLength = 5;
for (let i = 0; i < initialLength; i++) {
    cache.append({
        'symbol': symbol,
        'id': i.toString(),
        'i': i,
    });
}
let limited = cache.getLimit(symbol, undefined);
assert(initialLength === limited);
cache = new ArrayCacheBySymbolById();
let appendItemsLength = 3;
for (let i = 0; i < appendItemsLength; i++) {
    cache.append({
        'symbol': symbol,
        'id': i.toString(),
        'i': i,
    });
}
let outsideLimit = 5;
limited = cache.getLimit(symbol, outsideLimit);
assert(appendItemsLength === limited);
outsideLimit = 2; // if limit < newsUpdate that should be returned
limited = cache.getLimit(symbol, outsideLimit);
assert(outsideLimit === limited);
// ----------------------------------------------------------------------------
// test ArrayCacheBySymbolById limit with symbol undefined
symbol = 'BTC/USDT';
cache = new ArrayCacheBySymbolById();
initialLength = 5;
for (let i = 0; i < initialLength; i++) {
    cache.append({
        'symbol': symbol,
        'id': i.toString(),
        'i': i,
    });
}
limited = cache.getLimit(undefined, undefined);
assert(initialLength === limited);
cache = new ArrayCacheBySymbolById();
appendItemsLength = 3;
for (let i = 0; i < appendItemsLength; i++) {
    cache.append({
        'symbol': symbol,
        'id': i.toString(),
        'i': i,
    });
}
outsideLimit = 5;
limited = cache.getLimit(symbol, outsideLimit);
assert(appendItemsLength === limited);
outsideLimit = 2; // if limit < newsUpdate that should be returned
limited = cache.getLimit(symbol, outsideLimit);
assert(outsideLimit === limited);
// ----------------------------------------------------------------------------
// test ArrayCacheBySymbolById, same order should not increase the limit
cache = new ArrayCacheBySymbolById();
symbol = 'BTC/USDT';
const otherSymbol = 'ETH/USDT';
cache.append({ 'symbol': symbol, 'id': 'singleId', 'i': 3 });
cache.append({ 'symbol': symbol, 'id': 'singleId', 'i': 3 });
cache.append({ 'symbol': otherSymbol, 'id': 'singleId', 'i': 3 });
outsideLimit = 5;
limited = cache.getLimit(symbol, outsideLimit);
const limited2 = cache.getLimit(undefined, outsideLimit);
assert(limited == 1);
assert(limited2 == 2);
// ----------------------------------------------------------------------------
// test testLimitArrayCacheByTimestamp limit
cache = new ArrayCacheByTimestamp();
initialLength = 5;
for (let i = 0; i < initialLength; i++) {
    cache.append([
        i * 10,
        i * 10,
        i * 10,
        i * 10
    ]);
}
limited = cache.getLimit(undefined, undefined);
assert(initialLength === limited);
appendItemsLength = 3;
for (let i = 0; i < appendItemsLength; i++) {
    cache.append([
        i * 4,
        i * 4,
        i * 4,
        i * 4
    ]);
}
outsideLimit = 5;
limited = cache.getLimit(undefined, outsideLimit);
assert(appendItemsLength === limited);
outsideLimit = 2; // if limit < newsUpdate that should be returned
limited = cache.getLimit(undefined, outsideLimit);
assert(outsideLimit === limited);
// ----------------------------------------------------------------------------
// test ArrayCacheBySymbolById, watch all orders, same symbol and order id gets updated
cache = new ArrayCacheBySymbolById();
symbol = 'BTC/USDT';
outsideLimit = 5;
cache.append({ 'symbol': symbol, 'id': 'oneId', 'i': 3 }); // create first order
cache.getLimit(undefined, outsideLimit); // watch all orders
cache.append({ 'symbol': symbol, 'id': 'oneId', 'i': 4 }); // first order is closed
cache.getLimit(undefined, outsideLimit); // watch all orders
cache.append({ 'symbol': symbol, 'id': 'twoId', 'i': 5 }); // create second order
cache.getLimit(undefined, outsideLimit); // watch all orders
cache.append({ 'symbol': symbol, 'id': 'twoId', 'i': 6 }); // second order is closed
limited = cache.getLimit(undefined, outsideLimit); // watch all orders
assert(limited === 1); // one new update
// ----------------------------------------------------------------------------
// test ArrayCacheBySymbolById, watch all orders, and watchOrders (symbol) work independently
cache = new ArrayCacheBySymbolById();
symbol = 'BTC/USDT';
const symbol2 = 'ETH/USDT';
outsideLimit = 5;
cache.append({ 'symbol': symbol, 'id': 'one', 'i': 1 }); // create first order
cache.append({ 'symbol': symbol2, 'id': 'two', 'i': 1 }); // create second order
assert(cache.getLimit(undefined, outsideLimit) === 2); // watch all orders
assert(cache.getLimit(symbol, outsideLimit) === 1); // watch by symbol
cache.append({ 'symbol': symbol, 'id': 'one', 'i': 2 }); // update first order
cache.append({ 'symbol': symbol2, 'id': 'two', 'i': 2 }); // update second order
assert(cache.getLimit(symbol, outsideLimit) === 1); // watch by symbol
assert(cache.getLimit(undefined, outsideLimit) === 2); // watch all orders
cache.append({ 'symbol': symbol2, 'id': 'two', 'i': 3 }); // update second order
cache.append({ 'symbol': symbol2, 'id': 'three', 'i': 3 }); // create third order
assert(cache.getLimit(undefined, outsideLimit) === 2); // watch all orders
