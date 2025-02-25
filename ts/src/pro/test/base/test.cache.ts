import assert from 'assert';
import { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById, ArrayCacheBySymbolBySide } from '../../../base/ws/Cache.js';

function equals (a, b) {
    if (a.length !== b.length) {
        return false;
    }
    for (const prop in a) {
        if (prop === 'hashmap') {
            continue; // ignore internal prop
        }
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

function testWsCache () {
    const arrayCache = new ArrayCache (3);

    arrayCache.append ({ 'symbol': 'BTC/USDT', 'data': 1 });
    arrayCache.append ({ 'symbol': 'BTC/USDT', 'data': 2 });
    arrayCache.append ({ 'symbol': 'BTC/USDT', 'data': 3 });
    arrayCache.append ({ 'symbol': 'BTC/USDT', 'data': 4 });

    assert (equals (arrayCache, [
        { 'symbol': 'BTC/USDT', 'data': 2 },
        { 'symbol': 'BTC/USDT', 'data': 3 },
        { 'symbol': 'BTC/USDT', 'data': 4 },
    ]));

    arrayCache.append ({ 'symbol': 'BTC/USDT', 'data': 5 });
    arrayCache.append ({ 'symbol': 'BTC/USDT', 'data': 6 });
    arrayCache.append ({ 'symbol': 'BTC/USDT', 'data': 7 });
    arrayCache.append ({ 'symbol': 'BTC/USDT', 'data': 8 });

    assert (equals (arrayCache, [
        { 'symbol': 'BTC/USDT', 'data': 6 },
        { 'symbol': 'BTC/USDT', 'data': 7 },
        { 'symbol': 'BTC/USDT', 'data': 8 },
    ]));

    arrayCache.clear ();

    arrayCache.append ({ 'symbol': 'BTC/USDT', 'data': 1 });

    assert (equals (arrayCache, [
        { 'symbol': 'BTC/USDT', 'data': 1 },
    ]));

    // ----------------------------------------------------------------------------

    const arraycache2 = new ArrayCache (1);

    arraycache2.append ({ 'symbol': 'BTC/USDT', 'data': 1 });
    arraycache2.append ({ 'symbol': 'BTC/USDT', 'data': 2 });

    assert (equals (arraycache2, [
        { 'symbol': 'BTC/USDT', 'data': 2 },
    ]));

    // ----------------------------------------------------------------------------

    const timestampCache = new ArrayCacheByTimestamp ();

    const ohlcv1 = [ 100, 1, 2, 3 ];
    const ohlcv2 = [ 200, 5, 6, 7 ];
    timestampCache.append (ohlcv1);
    timestampCache.append (ohlcv2);

    assert (equals (timestampCache, [ ohlcv1, ohlcv2 ]));

    const modify2 = [ 200, 10, 11, 12 ];
    timestampCache.append (modify2);

    assert (equals (timestampCache, [ ohlcv1, modify2 ]));

    // ----------------------------------------------------------------------------

    const cacheSymbolId = new ArrayCacheBySymbolById ();

    const object1 = { 'symbol': 'BTC/USDT', 'id': 'abcdef', 'i': 1 };
    const object2 = { 'symbol': 'ETH/USDT', 'id': 'qwerty', 'i': 2 };
    const object3 = { 'symbol': 'BTC/USDT', 'id': 'abcdef', 'i': 3 };
    cacheSymbolId.append (object1);
    cacheSymbolId.append (object2);
    cacheSymbolId.append (object3); // should update index 0

    assert (equals (cacheSymbolId, [ object2, object3 ]));

    // ----------------------------------------------------------------------------

    const cacheSymbolId5 = new ArrayCacheBySymbolById (5);

    for (let i = 1; i < 11; i++) {
        cacheSymbolId5.append ({
            'symbol': 'BTC/USDT',
            'id': i.toString (),
            'i': i,
        });
    }

    assert (equals (cacheSymbolId5, [
        { 'symbol': 'BTC/USDT', 'id': '6', 'i': 6 },
        { 'symbol': 'BTC/USDT', 'id': '7', 'i': 7 },
        { 'symbol': 'BTC/USDT', 'id': '8', 'i': 8 },
        { 'symbol': 'BTC/USDT', 'id': '9', 'i': 9 },
        { 'symbol': 'BTC/USDT', 'id': '10', 'i': 10 },
    ]));

    for (let i = 1; i < 11; i++) {
        cacheSymbolId5.append ({
            'symbol': 'BTC/USDT',
            'id': i.toString (),
            'i': i + 10,
        });
    }

    assert (equals (cacheSymbolId5, [
        { 'symbol': 'BTC/USDT', 'id': '6', 'i': 16 },
        { 'symbol': 'BTC/USDT', 'id': '7', 'i': 17 },
        { 'symbol': 'BTC/USDT', 'id': '8', 'i': 18 },
        { 'symbol': 'BTC/USDT', 'id': '9', 'i': 19 },
        { 'symbol': 'BTC/USDT', 'id': '10', 'i': 20 },
    ]));

    const middle = { 'symbol': 'BTC/USDT', 'id': '8', 'i': 28 };
    cacheSymbolId5.append (middle);

    assert (equals (cacheSymbolId5, [
        { 'symbol': 'BTC/USDT', 'id': '6', 'i': 16 },
        { 'symbol': 'BTC/USDT', 'id': '7', 'i': 17 },
        { 'symbol': 'BTC/USDT', 'id': '9', 'i': 19 },
        { 'symbol': 'BTC/USDT', 'id': '10', 'i': 20 },
        { 'symbol': 'BTC/USDT', 'id': '8', 'i': 28 },
    ]));

    const otherMiddle = { 'symbol': 'BTC/USDT', 'id': '7', 'i': 27 };
    cacheSymbolId5.append (otherMiddle);

    assert (equals (cacheSymbolId5, [
        { 'symbol': 'BTC/USDT', 'id': '6', 'i': 16 },
        { 'symbol': 'BTC/USDT', 'id': '9', 'i': 19 },
        { 'symbol': 'BTC/USDT', 'id': '10', 'i': 20 },
        { 'symbol': 'BTC/USDT', 'id': '8', 'i': 28 },
        { 'symbol': 'BTC/USDT', 'id': '7', 'i': 27 },
    ]));

    for (let i = 30; i < 33; i++) {
        cacheSymbolId5.append ({
            'symbol': 'BTC/USDT',
            'id': i.toString (),
            'i': i + 10,
        });
    }

    assert (equals (cacheSymbolId5, [
        { 'symbol': 'BTC/USDT', 'id': '8', 'i': 28 },
        { 'symbol': 'BTC/USDT', 'id': '7', 'i': 27 },
        { 'symbol': 'BTC/USDT', 'id': '30', 'i': 40 },
        { 'symbol': 'BTC/USDT', 'id': '31', 'i': 41 },
        { 'symbol': 'BTC/USDT', 'id': '32', 'i': 42 } ]));

    const first = { 'symbol': 'BTC/USDT', 'id': '8', 'i': 38 };
    cacheSymbolId5.append (first);

    assert (equals (cacheSymbolId5, [
        { 'symbol': 'BTC/USDT', 'id': '7', 'i': 27 },
        { 'symbol': 'BTC/USDT', 'id': '30', 'i': 40 },
        { 'symbol': 'BTC/USDT', 'id': '31', 'i': 41 },
        { 'symbol': 'BTC/USDT', 'id': '32', 'i': 42 },
        { 'symbol': 'BTC/USDT', 'id': '8', 'i': 38 },
    ]));

    const another = { 'symbol': 'BTC/USDT', 'id': '30', 'i': 50 };
    cacheSymbolId5.append (another);

    assert (equals (cacheSymbolId5, [
        { 'symbol': 'BTC/USDT', 'id': '7', 'i': 27 },
        { 'symbol': 'BTC/USDT', 'id': '31', 'i': 41 },
        { 'symbol': 'BTC/USDT', 'id': '32', 'i': 42 },
        { 'symbol': 'BTC/USDT', 'id': '8', 'i': 38 },
        { 'symbol': 'BTC/USDT', 'id': '30', 'i': 50 },
    ]));

    // ----------------------------------------------------------------------------

    // test ArrayCacheBySymbolById limit with symbol set
    let symbol = 'BTC/USDT';
    const cacheSymbolId2 = new ArrayCacheBySymbolById ();
    let initialLength = 5;
    for (let i = 0; i < initialLength; i++) {
        cacheSymbolId2.append ({
            'symbol': symbol,
            'id': i.toString (),
            'i': i,
        });
    }

    let limited = cacheSymbolId2.getLimit (symbol, undefined);

    assert (initialLength === limited);

    // ----------------------------------------------------------------------------

    const cacheSymbolId3 = new ArrayCacheBySymbolById ();
    let appendItemsLength = 3;
    for (let i = 0; i < appendItemsLength; i++) {
        cacheSymbolId3.append ({
            'symbol': symbol,
            'id': i.toString (),
            'i': i,
        });
    }
    let outsideLimit = 5;
    limited = cacheSymbolId3.getLimit (symbol, outsideLimit);

    assert (appendItemsLength === limited);

    outsideLimit = 2; // if limit < newsUpdate that should be returned
    limited = cacheSymbolId3.getLimit (symbol, outsideLimit);

    assert (outsideLimit === limited);

    // ----------------------------------------------------------------------------

    // test ArrayCacheBySymbolById limit with symbol undefined
    symbol = 'BTC/USDT';
    const cacheSymbolId4 = new ArrayCacheBySymbolById ();
    initialLength = 5;
    for (let i = 0; i < initialLength; i++) {
        cacheSymbolId4.append ({
            'symbol': symbol,
            'id': i.toString (),
            'i': i,
        });
    }

    limited = cacheSymbolId4.getLimit (undefined, undefined);

    assert (initialLength === limited);

    // ----------------------------------------------------------------------------

    const cacheSymbolId6 = new ArrayCacheBySymbolById ();
    appendItemsLength = 3;
    for (let i = 0; i < appendItemsLength; i++) {
        cacheSymbolId6.append ({
            'symbol': symbol,
            'id': i.toString (),
            'i': i,
        });
    }
    outsideLimit = 5;
    limited = cacheSymbolId6.getLimit (symbol, outsideLimit);

    assert (appendItemsLength === limited);

    outsideLimit = 2; // if limit < newsUpdate that should be returned
    limited = cacheSymbolId6.getLimit (symbol, outsideLimit);

    assert (outsideLimit === limited);


    // ----------------------------------------------------------------------------
    // test ArrayCacheBySymbolById, same order should not increase the limit

    const cacheSymbolId7 = new ArrayCacheBySymbolById ();
    symbol = 'BTC/USDT';
    const otherSymbol = 'ETH/USDT';

    cacheSymbolId7.append ({ 'symbol': symbol, 'id': 'singleId', 'i': 3 });
    cacheSymbolId7.append ({ 'symbol': symbol, 'id': 'singleId', 'i': 3 });
    cacheSymbolId7.append ({ 'symbol': otherSymbol, 'id': 'singleId', 'i': 3 });
    outsideLimit = 5;
    limited = cacheSymbolId7.getLimit (symbol, outsideLimit);
    const limited2 = cacheSymbolId7.getLimit (undefined, outsideLimit);

    assert (limited === 1);
    assert (limited2 === 2);

    // ----------------------------------------------------------------------------
    // test testLimitArrayCacheByTimestamp limit

    const timestampCache2 = new ArrayCacheByTimestamp ();

    initialLength = 5;
    for (let i = 0; i < initialLength; i++) {
        timestampCache2.append ([
            i * 10,
            i * 10,
            i * 10,
            i * 10
        ]);
    }

    limited = timestampCache2.getLimit (undefined, undefined);

    assert (initialLength === limited);

    appendItemsLength = 3;
    for (let i = 0; i < appendItemsLength; i++) {
        timestampCache2.append ([
            i * 4,
            i * 4,
            i * 4,
            i * 4
        ]);
    }
    outsideLimit = 5;
    limited = timestampCache2.getLimit (undefined, outsideLimit);

    assert (appendItemsLength === limited);

    outsideLimit = 2; // if limit < newsUpdate that should be returned
    limited = timestampCache2.getLimit (undefined, outsideLimit);

    assert (outsideLimit === limited);


    // ----------------------------------------------------------------------------
    // test ArrayCacheBySymbolById, watch all orders, same symbol and order id gets updated

    const cacheSymbolId8 = new ArrayCacheBySymbolById ();
    symbol = 'BTC/USDT';
    outsideLimit = 5;
    cacheSymbolId8.append ({ 'symbol': symbol, 'id': 'oneId', 'i': 3 }); // create first order
    cacheSymbolId8.getLimit (undefined, outsideLimit); // watch all orders
    cacheSymbolId8.append ({ 'symbol': symbol, 'id': 'oneId', 'i': 4 }); // first order is closed
    cacheSymbolId8.getLimit (undefined, outsideLimit); // watch all orders
    cacheSymbolId8.append ({ 'symbol': symbol, 'id': 'twoId', 'i': 5 }); // create second order
    cacheSymbolId8.getLimit (undefined, outsideLimit); // watch all orders
    cacheSymbolId8.append ({ 'symbol': symbol, 'id': 'twoId', 'i': 6 }); // second order is closed
    limited = cacheSymbolId8.getLimit (undefined, outsideLimit); // watch all orders
    assert (limited === 1); // one new update

    // ----------------------------------------------------------------------------
    // test ArrayCacheBySymbolById, watch all orders, and watchOrders (symbol) work independently

    const cacheSymbolId9 = new ArrayCacheBySymbolById ();
    symbol = 'BTC/USDT';
    let symbol2 = 'ETH/USDT';

    outsideLimit = 5;
    cacheSymbolId9.append ({ 'symbol': symbol, 'id': 'one', 'i': 1 }); // create first order
    cacheSymbolId9.append ({ 'symbol': symbol2, 'id': 'two', 'i': 1 }); // create second order
    assert (cacheSymbolId9.getLimit (undefined, outsideLimit) === 2); // watch all orders
    assert (cacheSymbolId9.getLimit (symbol, outsideLimit) === 1); // watch by symbol
    cacheSymbolId9.append ({ 'symbol': symbol, 'id': 'one', 'i': 2 }); // update first order
    cacheSymbolId9.append ({ 'symbol': symbol2, 'id': 'two', 'i': 2 }); // update second order
    assert (cacheSymbolId9.getLimit (symbol, outsideLimit) === 1); // watch by symbol
    assert (cacheSymbolId9.getLimit (undefined, outsideLimit) === 2); // watch all orders
    cacheSymbolId9.append ({ 'symbol': symbol2, 'id': 'two', 'i': 3 }); // update second order
    cacheSymbolId9.append ({ 'symbol': symbol2, 'id': 'three', 'i': 3 }); // create third order
    assert (cacheSymbolId9.getLimit (undefined, outsideLimit) === 2); // watch all orders

    // ----------------------------------------------------------------------------
    // test ArrayCacheBySymbolBySide, watch all positions, same symbol and side id gets updated

    const cacheSymbolSide = new ArrayCacheBySymbolBySide ();
    symbol = 'BTC/USDT';
    outsideLimit = 5;
    cacheSymbolSide.append ({ 'symbol': symbol, 'side': 'short', 'contracts': 1 }); // create first position
    cacheSymbolSide.append ({ 'symbol': symbol, 'side': 'short', 'contracts': 0 }); // first position is closed
    assert (cacheSymbolSide.getLimit (symbol, outsideLimit) === 1); // limit position
    cacheSymbolSide.append ({ 'symbol': symbol, 'side': 'short', 'contracts': 1 }); // create first position
    assert (cacheSymbolSide.getLimit (symbol, outsideLimit) === 1); // watch all positions

    // ----------------------------------------------------------------------------
    // test ArrayCacheBySymbolBySide, watch all positions, same symbol and side id gets updated

    const cacheSymbolSide2 = new ArrayCacheBySymbolBySide ();
    symbol = 'BTC/USDT';
    outsideLimit = 5;
    cacheSymbolSide2.append ({ 'symbol': symbol, 'side': 'short', 'contracts': 1 }); // create first position
    assert (cacheSymbolSide2.getLimit (undefined, outsideLimit) === 1); // watch all positions
    cacheSymbolSide2.append ({ 'symbol': symbol, 'side': 'short', 'contracts': 0 }); // first position is closed
    assert (cacheSymbolSide2.getLimit (undefined, outsideLimit) === 1); // watch all positions
    cacheSymbolSide2.append ({ 'symbol': symbol, 'side': 'long', 'contracts': 3 }); // create second position
    assert (cacheSymbolSide2.getLimit (undefined, outsideLimit) === 1); // watch all positions
    cacheSymbolSide2.append ({ 'symbol': symbol, 'side': 'long', 'contracts': 2 }); // second position is reduced
    cacheSymbolSide2.append ({ 'symbol': symbol, 'side': 'long', 'contracts': 1 }); // second position is reduced
    assert (cacheSymbolSide2.getLimit (undefined, outsideLimit) === 1); // watch all orders

    // ----------------------------------------------------------------------------
    // test ArrayCacheBySymbolBySide, watchPositions, and watchPosition (symbol) work independently

    const cacheSymbolSide3 = new ArrayCacheBySymbolBySide ();
    symbol = 'BTC/USDT';
    symbol2 = 'ETH/USDT';

    cacheSymbolSide3.append ({ 'symbol': symbol, 'side': 'short', 'contracts': 1 }); // create first position
    cacheSymbolSide3.append ({ 'symbol': symbol2, 'side': 'long', 'contracts': 1 }); // create second position
    assert (cacheSymbolSide3.getLimit (undefined, outsideLimit) === 2); // watch all positions
    assert (cacheSymbolSide3.getLimit (symbol, outsideLimit) === 1); // watch by symbol
    cacheSymbolSide3.append ({ 'symbol': symbol, 'side': 'short', 'contracts': 2 }); // update first position
    cacheSymbolSide3.append ({ 'symbol': symbol2, 'side': 'long', 'contracts': 2 }); // update second position
    assert (cacheSymbolSide3.getLimit (symbol, outsideLimit) === 1); // watch by symbol
    assert (cacheSymbolSide3.getLimit (undefined, outsideLimit) === 2); // watch all positions
    cacheSymbolSide3.append ({ 'symbol': symbol2, 'side': 'long', 'contracts': 3 }); // update second position
    assert (cacheSymbolSide3.getLimit (undefined, outsideLimit) === 1); // watch all positions

    // ----------------------------------------------------------------------------
    // test ArrayCacheBySymbolBySide, watchPositions does not override

    const cacheSymbolSide4 = new ArrayCacheBySymbolBySide ();
    symbol = 'BTC/USDT';
    symbol2 = 'ETH/USDT';
    const symbol3 = 'XRP/USDT';

    cacheSymbolSide4.append ({ 'symbol': symbol, 'side': 'long', 'contracts': 1 }); // create first position
    cacheSymbolSide4.append ({ 'symbol': symbol2, 'side': 'long', 'contracts': 2 }); // create second position
    cacheSymbolSide4.append ({ 'symbol': symbol3, 'side': 'long', 'contracts': 3 }); // create short position
    assert (cacheSymbolSide4[0]['symbol'] === symbol);
    assert (cacheSymbolSide4[1]['symbol'] === symbol2);
    cacheSymbolSide4.append ({ 'symbol': symbol2, 'side': 'long', 'contracts': 4 }); // update first position
    assert (cacheSymbolSide4[0]['contracts'] === 1 && cacheSymbolSide4[0]['symbol'] === symbol);
    assert (cacheSymbolSide4[1]['contracts'] === 3 && cacheSymbolSide4[1]['symbol'] === symbol3);
    assert (cacheSymbolSide4[2]['contracts'] === 4 && cacheSymbolSide4[2]['symbol'] === symbol2);
    const arrayLength = cacheSymbolSide4.length;
    assert (arrayLength === 3);
}

export default testWsCache;
