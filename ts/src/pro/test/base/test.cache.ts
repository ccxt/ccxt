import assert from 'assert';
import { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById, ArrayCacheByOutcomeById, ArrayCacheBySymbolBySide } from '../../../base/ws/Cache.js';

function equals (a: any, b: any) {
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

    // ----------------------------------------------------------------------------
    // test clear () really resets ArrayCacheBySymbolById - the hashmap used to keep
    // claiming the cleared ids, so re-appending them merged into orphaned references
    // and findIndex returned -1, making splice (-1, 1) drop an unrelated row

    const cacheClearById = new ArrayCacheBySymbolById ();
    cacheClearById.append ({ 'symbol': 'BTC/USDT', 'id': 'a', 'i': 1 });
    cacheClearById.append ({ 'symbol': 'BTC/USDT', 'id': 'b', 'i': 2 });
    cacheClearById.clear ();

    assert (cacheClearById.length === 0);
    assert (cacheClearById.getLimit (undefined, 10) === 0); // no phantom updates

    cacheClearById.append ({ 'symbol': 'BTC/USDT', 'id': 'a', 'i': 3 });
    cacheClearById.append ({ 'symbol': 'BTC/USDT', 'id': 'b', 'i': 4 });

    assert (equals (cacheClearById, [
        { 'symbol': 'BTC/USDT', 'id': 'a', 'i': 3 },
        { 'symbol': 'BTC/USDT', 'id': 'b', 'i': 4 },
    ]));

    // ----------------------------------------------------------------------------
    // test clear () really resets ArrayCacheByTimestamp - a re-appended timestamp
    // used to merge into a reference that was no longer in the array, so the candle
    // was silently dropped and the cache stayed empty

    const cacheClearTimestamp = new ArrayCacheByTimestamp ();
    cacheClearTimestamp.append ([ 100, 1, 2, 3 ]);
    cacheClearTimestamp.append ([ 200, 4, 5, 6 ]);
    cacheClearTimestamp.clear ();

    assert (cacheClearTimestamp.length === 0);
    assert (cacheClearTimestamp.getLimit (undefined, 10) === 0); // no phantom updates

    cacheClearTimestamp.append ([ 100, 7, 8, 9 ]);

    assert (equals (cacheClearTimestamp, [ [ 100, 7, 8, 9 ] ]));

    // ----------------------------------------------------------------------------
    // test clear () really resets ArrayCacheBySymbolBySide

    const cacheClearBySide = new ArrayCacheBySymbolBySide ();
    cacheClearBySide.append ({ 'symbol': 'BTC/USDT', 'side': 'long', 'contracts': 1 });
    cacheClearBySide.append ({ 'symbol': 'ETH/USDT', 'side': 'long', 'contracts': 2 });
    cacheClearBySide.clear ();

    const clearedBySideLength = cacheClearBySide.length;
    assert (clearedBySideLength === 0);

    cacheClearBySide.append ({ 'symbol': 'BTC/USDT', 'side': 'long', 'contracts': 3 });
    cacheClearBySide.append ({ 'symbol': 'ETH/USDT', 'side': 'long', 'contracts': 4 });

    const reappendedBySideLength = cacheClearBySide.length;
    assert (reappendedBySideLength === 2);
    assert (cacheClearBySide[0]['contracts'] === 3);
    assert (cacheClearBySide[1]['contracts'] === 4);

    // ----------------------------------------------------------------------------
    // test a falsy maxSize means unbounded, it must not swallow rows

    const cacheUnbounded = new ArrayCache (0);
    cacheUnbounded.append ({ 'symbol': 'BTC/USDT', 'data': 1 });
    cacheUnbounded.append ({ 'symbol': 'BTC/USDT', 'data': 2 });
    cacheUnbounded.append ({ 'symbol': 'BTC/USDT', 'data': 3 });

    assert (cacheUnbounded.length === 3);

    // ----------------------------------------------------------------------------
    // test a keyed update MERGES fields instead of replacing the row - a partial
    // order delta must not drop the fields it does not mention

    const cachePartial = new ArrayCacheBySymbolById ();
    cachePartial.append ({ 'symbol': 'BTC/USDT', 'id': 'a1', 'status': 'open', 'amount': 5, 'fee': 7 });
    cachePartial.append ({ 'symbol': 'BTC/USDT', 'id': 'a1', 'status': 'closed' });

    assert (cachePartial.length === 1);
    assert (cachePartial[0]['status'] === 'closed');
    assert (cachePartial[0]['amount'] === 5);
    assert (cachePartial[0]['fee'] === 7);

    // ----------------------------------------------------------------------------
    // test the symbol and the id are matched as two separate fields - concatenating
    // them makes ('BTC/USDT1', '2') collide with ('BTC/USDT', '12')

    const cacheColliding = new ArrayCacheBySymbolById ();
    cacheColliding.append ({ 'symbol': 'BTC/USDT1', 'id': '2', 'i': 1 });
    cacheColliding.append ({ 'symbol': 'BTC/USDT', 'id': '12', 'i': 2 });

    assert (cacheColliding.length === 2);
    assert (cacheColliding[0]['i'] === 1);
    assert (cacheColliding[1]['i'] === 2);

    // ----------------------------------------------------------------------------
    // test two symbols may share one order id - matching on the id alone splices
    // out the wrong row, so assert the positional contents and not just the count

    const cacheSharedId = new ArrayCacheBySymbolById ();
    cacheSharedId.append ({ 'symbol': 'BTC/USDT', 'id': 'shared', 'i': 1 });
    cacheSharedId.append ({ 'symbol': 'ETH/USDT', 'id': 'shared', 'i': 2 });
    cacheSharedId.append ({ 'symbol': 'BTC/USDT', 'id': 'shared', 'i': 3 });

    assert (equals (cacheSharedId, [
        { 'symbol': 'ETH/USDT', 'id': 'shared', 'i': 2 },
        { 'symbol': 'BTC/USDT', 'id': 'shared', 'i': 3 },
    ]));

    // ----------------------------------------------------------------------------
    // test ArrayCacheByTimestamp eviction. Re-appending an evicted timestamp must
    // create a fresh row at the end, which proves the hashmap entry went away with
    // the evicted candle instead of leaking

    const cacheTimestampLimited = new ArrayCacheByTimestamp (3);

    for (let i = 1; i < 7; i++) {
        cacheTimestampLimited.append ([ i * 100, i, i, i ]);
    }

    assert (equals (cacheTimestampLimited, [
        [ 400, 4, 4, 4 ],
        [ 500, 5, 5, 5 ],
        [ 600, 6, 6, 6 ],
    ]));

    cacheTimestampLimited.append ([ 100, 9, 9, 9 ]);

    assert (equals (cacheTimestampLimited, [
        [ 500, 5, 5, 5 ],
        [ 600, 6, 6, 6 ],
        [ 100, 9, 9, 9 ],
    ]));

    // ----------------------------------------------------------------------------
    // test a shorter OHLCV update does not leave a stale tail behind - merging
    // [ 100, 9, 9 ] onto [ 100, 1, 2, 3, 4, 5 ] used to yield [ 100, 9, 9, 3, 4, 5 ]

    const cacheShortOhlcv = new ArrayCacheByTimestamp ();
    cacheShortOhlcv.append ([ 100, 1, 2, 3, 4, 5 ]);
    cacheShortOhlcv.append ([ 100, 9, 9 ]);

    assert (cacheShortOhlcv.length === 1);
    assert (equals (cacheShortOhlcv, [ [ 100, 9, 9 ] ]));

    // ----------------------------------------------------------------------------
    // test ArrayCacheByOutcomeById keys the first nesting level on the outcome and
    // not on the symbol - prediction markets stream several outcomes of the same
    // market, so a symbol-keyed lookup would merge two distinct outcomes that
    // happen to share one order id into a single row

    const cacheByOutcome = new ArrayCacheByOutcomeById ();
    cacheByOutcome.append ({ 'symbol': 'TRUMP-2024', 'outcome': 'yes', 'id': 'o1', 'i': 1 });
    cacheByOutcome.append ({ 'symbol': 'TRUMP-2024', 'outcome': 'no', 'id': 'o1', 'i': 2 });
    cacheByOutcome.append ({ 'symbol': 'TRUMP-2024', 'outcome': 'yes', 'id': 'o1', 'i': 3 });

    assert (equals (cacheByOutcome, [
        { 'symbol': 'TRUMP-2024', 'outcome': 'no', 'id': 'o1', 'i': 2 },
        { 'symbol': 'TRUMP-2024', 'outcome': 'yes', 'id': 'o1', 'i': 3 },
    ]));

    // ----------------------------------------------------------------------------
    // test a numeric id is matched the same way a string one is - exchanges do send
    // integer order ids, and the lookup must neither throw nor miss and append a
    // duplicate row instead of merging the update in

    const cacheNumericId = new ArrayCacheBySymbolById ();
    cacheNumericId.append ({ 'symbol': 'BTC/USDT', 'id': 1, 'status': 'open', 'amount': 5 });
    cacheNumericId.append ({ 'symbol': 'BTC/USDT', 'id': 1, 'status': 'closed' });

    assert (cacheNumericId.length === 1);
    assert (cacheNumericId[0]['status'] === 'closed');
    assert (cacheNumericId[0]['amount'] === 5);

    // ----------------------------------------------------------------------------
    // test eviction removes the emptied outer bucket too - a stream of short-lived
    // symbols used to leak one empty object per symbol into the hashmap forever,
    // so the map grew without bound even though the array stayed at maxSize

    const cacheEvictBuckets = new ArrayCacheBySymbolById (3);

    for (let i = 0; i < 10; i++) {
        cacheEvictBuckets.append ({ 'symbol': 'S' + i.toString () + '/USDT', 'id': 'x', 'i': i });
    }

    const evictedLength = cacheEvictBuckets.length;
    assert (evictedLength === 3);
    const bucketKeys = Object.keys (cacheEvictBuckets.hashmap);
    const bucketCount = bucketKeys.length;
    assert (bucketCount === 3); // no empty leftover buckets
}

export default testWsCache;
