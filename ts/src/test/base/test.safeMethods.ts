
// AUTO_TRANSPILE_ENABLED

import assert from 'assert';
import ccxt from '../../../ccxt.js';
import { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById, ArrayCacheBySymbolBySide } from '../../base/ws/Cache.js';

function equals (a, b) {
    // does not check if b has more properties than a
    // eslint-disable-next-line no-restricted-syntax
    for (const prop of Object.keys (a)) {
        if (a[prop] !== b[prop]) {
            return false;
        }
    }
    return true;
}

function testSafeMethods () {

    const exchange = new ccxt.Exchange ({
        'id': 'regirock',
    });

    const inputDict = {
        'i': 1,
        'f': 0.123,
        'bool': true,
        'list': [ 1, 2, 3 ],
        'dict': { 'a': 1 },
        'listOfDicts': [ { 'a': 1 } ],
        'str': 'heLlo',
        'strNumber': '3',
        //
        'zeroNumeric': 0,
        'zeroString': '0',
        'undefined': undefined,
        'emptyString': '',
        'floatNumeric': 0.123,
        'floatString': '0.123',
    };

    const inputList = [ 'Hi', 2 ];

    const compareDict = {
        'a': 1,
    };

    const compareList = [ 1, 2, 3 ];

    const factor = 10;

    // safeValue
    assert (exchange.safeValue (inputDict, 'i') === 1);
    assert (exchange.safeValue (inputDict, 'f') === 0.123);
    assert (exchange.safeValue (inputDict, 'bool') === true);
    assert (equals (exchange.safeValue (inputDict, 'list'), compareList));
    let dictObject = exchange.safeValue (inputDict, 'dict');
    assert (equals (dictObject, compareDict));
    assert (exchange.safeValue (inputDict, 'str') === 'heLlo');
    assert (exchange.safeValue (inputDict, 'strNumber') === '3');
    assert (exchange.safeValue (inputList, 0) === 'Hi');

    // safeValue2
    assert (exchange.safeValue2 (inputDict, 'a', 'i') === 1);
    assert (exchange.safeValue2 (inputDict, 'a', 'f') === 0.123);
    assert (exchange.safeValue2 (inputDict, 'a', 'bool') === true);
    assert (equals (exchange.safeValue2 (inputDict, 'a', 'list'), compareList));
    dictObject = exchange.safeValue2 (inputDict, 'a', 'dict');
    assert (equals (dictObject, compareDict));
    assert (exchange.safeValue2 (inputDict, 'a', 'str') === 'heLlo');
    assert (exchange.safeValue2 (inputDict, 'a', 'strNumber') === '3');
    assert (exchange.safeValue2 (inputList, 2, 0) === 'Hi');

    // safeValueN
    assert (exchange.safeValueN (inputDict, [ 'a', 'b', 'i' ]) === 1);
    assert (exchange.safeValueN (inputDict, [ 'a', 'b', 'f' ]) === 0.123);
    assert (exchange.safeValueN (inputDict, [ 'a', 'b', 'bool' ]) === true);
    assert (equals (exchange.safeValueN (inputDict, [ 'a', 'b', 'list' ]), compareList));
    dictObject = exchange.safeValueN (inputDict, [ 'a', 'b', 'dict' ]);
    assert (equals (dictObject, compareDict));
    assert (exchange.safeValueN (inputDict, [ 'a', 'b', 'str' ]) === 'heLlo');
    assert (exchange.safeValueN (inputDict, [ 'a', 'b', 'strNumber' ]) === '3');
    assert (exchange.safeValueN (inputList, [ 3, 2, 0 ]) === 'Hi');

    // safeDict
    dictObject = exchange.safeDict (inputDict, 'dict');
    assert (equals (dictObject, compareDict));
    let listObject = exchange.safeDict (inputDict, 'list');
    assert (listObject === undefined);
    assert (exchange.safeDict (inputList, 1) === undefined);

    // safeDict2
    dictObject = exchange.safeDict2 (inputDict, 'a', 'dict');
    assert (equals (dictObject, compareDict));
    listObject = exchange.safeDict2 (inputDict, 'a', 'list');
    assert (listObject === undefined);
    // @ts-expect-error
    assert (exchange.safeDict2 (inputList, 2, 1) === undefined);

    // safeDictN
    dictObject = exchange.safeDictN (inputDict, [ 'a', 'b', 'dict' ]);
    assert (equals (dictObject, compareDict));
    listObject = exchange.safeDictN (inputDict, [ 'a', 'b', 'list' ]);
    assert (listObject === undefined);
    assert (exchange.safeDictN (inputList, [ 3, 2, 1 ]) === undefined);

    // safeList
    listObject = exchange.safeList (inputDict, 'list');
    assert (equals (dictObject, compareDict));
    assert (exchange.safeList (inputDict, 'dict') === undefined);
    assert (exchange.safeList (inputList, 1) === undefined);
    const arrayOfDicts = exchange.safeList (inputDict, 'listOfDicts');
    assert (equals (arrayOfDicts[0], { 'a': 1 }));

    // safeList2
    listObject = exchange.safeList2 (inputDict, 'a', 'list');
    assert (equals (dictObject, compareDict));
    assert (exchange.safeList2 (inputDict, 'a', 'dict') === undefined);
    // @ts-expect-error
    assert (exchange.safeList2 (inputList, 2, 1) === undefined);

    // safeListN
    listObject = exchange.safeListN (inputDict, [ 'a', 'b', 'list' ]);
    assert (equals (dictObject, compareDict));
    assert (exchange.safeListN (inputDict, [ 'a', 'b', 'dict' ]) === undefined);
    assert (exchange.safeListN (inputList, [ 3, 2, 1 ]) === undefined);
    // safeString
    assert (exchange.safeString (inputDict, 'i') === '1');
    assert (exchange.safeString (inputDict, 'f') === '0.123');
    // assert (exchange.safeString (inputDict, 'bool') === 'true'); returns True in python and 'true' in js
    assert (exchange.safeString (inputDict, 'str') === 'heLlo');
    assert (exchange.safeString (inputDict, 'strNumber') === '3');
    assert (exchange.safeString (inputList, 0) === 'Hi');

    // safeString2
    assert (exchange.safeString2 (inputDict, 'a', 'i') === '1');
    assert (exchange.safeString2 (inputDict, 'a', 'f') === '0.123');
    assert (exchange.safeString2 (inputDict, 'a', 'str') === 'heLlo');
    assert (exchange.safeString2 (inputDict, 'a', 'strNumber') === '3');
    assert (exchange.safeString2 (inputList, 2, 0) === 'Hi');

    // safeStringN
    assert (exchange.safeStringN (inputDict, [ 'a', 'b', 'i' ]) === '1');
    assert (exchange.safeStringN (inputDict, [ 'a', 'b', 'f' ]) === '0.123');
    assert (exchange.safeStringN (inputDict, [ 'a', 'b', 'str' ]) === 'heLlo');
    assert (exchange.safeStringN (inputDict, [ 'a', 'b', 'strNumber' ]) === '3');
    assert (exchange.safeStringN (inputList, [ 3, 2, 0 ]) === 'Hi');

    // safeStringLower
    assert (exchange.safeStringLower (inputDict, 'i') === '1');
    assert (exchange.safeStringLower (inputDict, 'f') === '0.123');
    assert (exchange.safeStringLower (inputDict, 'str') === 'hello');
    assert (exchange.safeStringLower (inputDict, 'strNumber') === '3');
    assert (exchange.safeStringLower (inputList, 0) === 'hi');

    // safeStringLower2
    assert (exchange.safeStringLower2 (inputDict, 'a', 'i') === '1');
    assert (exchange.safeStringLower2 (inputDict, 'a', 'f') === '0.123');
    assert (exchange.safeStringLower2 (inputDict, 'a', 'str') === 'hello');
    assert (exchange.safeStringLower2 (inputDict, 'a', 'strNumber') === '3');
    assert (exchange.safeStringLower2 (inputList, 2, 0) === 'hi');

    // safeStringLowerN
    assert (exchange.safeStringLowerN (inputDict, [ 'a', 'b', 'i' ]) === '1');
    assert (exchange.safeStringLowerN (inputDict, [ 'a', 'b', 'f' ]) === '0.123');
    assert (exchange.safeStringLowerN (inputDict, [ 'a', 'b', 'str' ]) === 'hello');
    assert (exchange.safeStringLowerN (inputDict, [ 'a', 'b', 'strNumber' ]) === '3');
    assert (exchange.safeStringLowerN (inputList, [ 3, 2, 0 ]) === 'hi');

    // safeStringUpper
    assert (exchange.safeStringUpper (inputDict, 'i') === '1');
    assert (exchange.safeStringUpper (inputDict, 'f') === '0.123');
    assert (exchange.safeStringUpper (inputDict, 'str') === 'HELLO');
    assert (exchange.safeStringUpper (inputDict, 'strNumber') === '3');
    assert (exchange.safeStringUpper (inputList, 0) === 'HI');

    // safeStringUpper2
    assert (exchange.safeStringUpper2 (inputDict, 'a', 'i') === '1');
    assert (exchange.safeStringUpper2 (inputDict, 'a', 'f') === '0.123');
    assert (exchange.safeStringUpper2 (inputDict, 'a', 'str') === 'HELLO');
    assert (exchange.safeStringUpper2 (inputDict, 'a', 'strNumber') === '3');
    assert (exchange.safeStringUpper2 (inputList, 2, 0) === 'HI');

    // safeStringUpperN
    assert (exchange.safeStringUpperN (inputDict, [ 'a', 'b', 'i' ]) === '1');
    assert (exchange.safeStringUpperN (inputDict, [ 'a', 'b', 'f' ]) === '0.123');
    assert (exchange.safeStringUpperN (inputDict, [ 'a', 'b', 'str' ]) === 'HELLO');
    assert (exchange.safeStringUpperN (inputDict, [ 'a', 'b', 'strNumber' ]) === '3');
    assert (exchange.safeStringUpperN (inputList, [ 3, 2, 0 ]) === 'HI');

    // safeInteger
    assert (exchange.safeInteger (inputDict, 'i') === 1);
    assert (exchange.safeInteger (inputDict, 'f') === 0);
    assert (exchange.safeInteger (inputDict, 'strNumber') === 3);
    assert (exchange.safeInteger (inputList, 1) === 2);

    // safeInteger2
    assert (exchange.safeInteger2 (inputDict, 'a', 'i') === 1);
    assert (exchange.safeInteger2 (inputDict, 'a', 'f') === 0);
    assert (exchange.safeInteger2 (inputDict, 'a', 'strNumber') === 3);
    assert (exchange.safeInteger2 (inputList, 2, 1) === 2);

    // safeIntegerN
    assert (exchange.safeIntegerN (inputDict, [ 'a', 'b', 'i' ]) === 1);
    assert (exchange.safeIntegerN (inputDict, [ 'a', 'b', 'f' ]) === 0);
    assert (exchange.safeIntegerN (inputDict, [ 'a', 'b', 'strNumber' ]) === 3);
    assert (exchange.safeIntegerN (inputList, [ 3, 2, 1 ]) === 2);

    // safeIntegerOmitZero
    assert (exchange.safeIntegerOmitZero (inputDict, 'i') === 1);
    assert (exchange.safeIntegerOmitZero (inputDict, 'f') === undefined);
    assert (exchange.safeIntegerOmitZero (inputDict, 'strNumber') === 3);
    assert (exchange.safeIntegerOmitZero (inputList, 1) === 2);

    // safeIntegerProduct
    assert (exchange.safeIntegerProduct (inputDict, 'i', factor) === 10);
    assert (exchange.safeIntegerProduct (inputDict, 'f', factor) === 1); // NB the result is 1
    assert (exchange.safeIntegerProduct (inputDict, 'strNumber', factor) === 30);
    assert (exchange.safeIntegerProduct (inputList, 1, factor) === 20);

    // safeIntegerProduct2
    assert (exchange.safeIntegerProduct2 (inputDict, 'a', 'i', factor) === 10);
    assert (exchange.safeIntegerProduct2 (inputDict, 'a', 'f', factor) === 1); // NB the result is 1
    assert (exchange.safeIntegerProduct2 (inputDict, 'a', 'strNumber', factor) === 30);
    assert (exchange.safeIntegerProduct2 (inputList, 2, 1, factor) === 20);

    // safeIntegerProductN
    assert (exchange.safeIntegerProductN (inputDict, [ 'a', 'b', 'i' ], factor) === 10);
    assert (exchange.safeIntegerProductN (inputDict, [ 'a', 'b', 'f' ], factor) === 1); // NB the result is 1
    assert (exchange.safeIntegerProductN (inputDict, [ 'a', 'b', 'strNumber' ], factor) === 30);
    assert (exchange.safeIntegerProductN (inputList, [ 3, 2, 1 ], factor) === 20);

    // safeTimestamp
    assert (exchange.safeTimestamp (inputDict, 'i') === 1000);
    assert (exchange.safeTimestamp (inputDict, 'f') === 123);
    assert (exchange.safeTimestamp (inputDict, 'strNumber') === 3000);
    assert (exchange.safeTimestamp (inputList, 1) === 2000);

    // safeTimestamp2
    assert (exchange.safeTimestamp2 (inputDict, 'a', 'i') === 1000);
    assert (exchange.safeTimestamp2 (inputDict, 'a', 'f') === 123);
    assert (exchange.safeTimestamp2 (inputDict, 'a', 'strNumber') === 3000);
    assert (exchange.safeTimestamp2 (inputList, 2, 1) === 2000);

    // safeTimestampN
    assert (exchange.safeTimestampN (inputDict, [ 'a', 'b', 'i' ]) === 1000);
    assert (exchange.safeTimestampN (inputDict, [ 'a', 'b', 'f' ]) === 123);
    assert (exchange.safeTimestampN (inputDict, [ 'a', 'b', 'strNumber' ]) === 3000);
    assert (exchange.safeTimestampN (inputList, [ 3, 2, 1 ]) === 2000);

    // safeFloat
    // @ts-expect-error
    assert (exchange.safeFloat (inputDict, 'i') === parseFloat (1));
    assert (exchange.safeFloat (inputDict, 'f') === 0.123);
    // @ts-expect-error
    assert (exchange.safeFloat (inputDict, 'strNumber') === parseFloat (3));
    // @ts-expect-error
    assert (exchange.safeFloat (inputList, 1) === parseFloat (2));

    // safeFloat2
    // @ts-expect-error
    assert (exchange.safeFloat2 (inputDict, 'a', 'i') === parseFloat (1));
    assert (exchange.safeFloat2 (inputDict, 'a', 'f') === 0.123);
    // @ts-expect-error
    assert (exchange.safeFloat2 (inputDict, 'a', 'strNumber') === parseFloat (3));
    // @ts-expect-error
    assert (exchange.safeFloat2 (inputList, 2, 1) === parseFloat (2));

    // safeFloatN
    // @ts-expect-error
    assert (exchange.safeFloatN (inputDict, [ 'a', 'b', 'i' ]) === parseFloat (1));
    assert (exchange.safeFloatN (inputDict, [ 'a', 'b', 'f' ]) === 0.123);
    // @ts-expect-error
    assert (exchange.safeFloatN (inputDict, [ 'a', 'b', 'strNumber' ]) === parseFloat (3));
    // @ts-expect-error
    assert (exchange.safeFloatN (inputList, [ 3, 2, 1 ]) === parseFloat (2));

    // safeNumber
    assert (exchange.safeNumber (inputDict, 'i') === exchange.parseNumber (1));
    assert (exchange.safeNumber (inputDict, 'f') === exchange.parseNumber (0.123));
    assert (exchange.safeNumber (inputDict, 'strNumber') === exchange.parseNumber (3));
    assert (exchange.safeNumber (inputList, 1) === exchange.parseNumber (2));
    assert (exchange.safeNumber (inputList, 'bool') === undefined);
    assert (exchange.safeNumber (inputList, 'list') === undefined);
    assert (exchange.safeNumber (inputList, 'dict') === undefined);
    assert (exchange.safeNumber (inputList, 'str') === undefined);

    // safeNumber2
    assert (exchange.safeNumber2 (inputDict, 'a', 'i') === exchange.parseNumber (1));
    assert (exchange.safeNumber2 (inputDict, 'a', 'f') === exchange.parseNumber (0.123));
    assert (exchange.safeNumber2 (inputDict, 'a', 'strNumber') === exchange.parseNumber (3));
    assert (exchange.safeNumber2 (inputList, 2, 1) === exchange.parseNumber (2));

    // safeNumberN
    assert (exchange.safeNumberN (inputDict, [ 'a', 'b', 'i' ]) === exchange.parseNumber (1));
    assert (exchange.safeNumberN (inputDict, [ 'a', 'b', 'f' ]) === exchange.parseNumber (0.123));
    assert (exchange.safeNumberN (inputDict, [ 'a', 'b', 'strNumber' ]) === exchange.parseNumber (3));
    assert (exchange.safeNumberN (inputList, [ 3, 2, 1 ]) === exchange.parseNumber (2));

    // safeBool
    assert (exchange.safeBool (inputDict, 'bool') === true);
    assert (exchange.safeBool (inputList, 1) === undefined);

    // safeBool2
    assert (exchange.safeBool2 (inputDict, 'a', 'bool') === true);
    assert (exchange.safeBool2 (inputList, 2, 1) === undefined);

    // safeBoolN
    assert (exchange.safeBoolN (inputDict, [ 'a', 'b', 'bool' ]) === true);
    assert (exchange.safeBoolN (inputList, [ 3, 2, 1 ]) === undefined);

    // safeNumberOmitZero
    assert (exchange.safeNumberOmitZero (inputDict, 'zeroNumeric') === undefined);
    assert (exchange.safeNumberOmitZero (inputDict, 'zeroString') === undefined);
    assert (exchange.safeNumberOmitZero (inputDict, 'undefined') === undefined);
    assert (exchange.safeNumberOmitZero (inputDict, 'emptyString') === undefined);
    assert (exchange.safeNumberOmitZero (inputDict, 'floatNumeric') !== undefined);
    assert (exchange.safeNumberOmitZero (inputDict, 'floatString') !== undefined);
    // tbd assert (exchange.safeNumberOmitZero (inputDict, 'bool') === undefined);
    // tbd assert (exchange.safeNumberOmitZero (inputDict, 'str') === undefined);

    // Test cache types - ArrayCache
    const arrayCache = new ArrayCache (100);
    arrayCache.append ({ 'symbol': 'BTC/USDT', 'id': 'order1', 'price': 50000 });
    assert (arrayCache.length > 0);

    // Test cache types - ArrayCacheByTimestamp
    const arrayCacheByTimestamp = new ArrayCacheByTimestamp (100);
    arrayCacheByTimestamp.append ([ 1000, 50000, 1, 2, 3 ]);
    const arrayCacheByTimestampData = exchange.safeValue (arrayCacheByTimestamp, 'Data');
    const cacheByTimestampData = arrayCacheByTimestampData !== undefined ? arrayCacheByTimestampData : arrayCacheByTimestamp;
    assert (cacheByTimestampData.length > 0);

    // Test cache types - ArrayCacheBySymbolById
    const arrayCacheBySymbolById = new ArrayCacheBySymbolById (100);
    arrayCacheBySymbolById.append ({ 'symbol': 'ETH/USDT', 'id': 'order2', 'price': 3000 });
    // Use direct property access for object attributes
    const arrayCacheBySymbolByIdHashmap = arrayCacheBySymbolById.hashmap;
    assert (arrayCacheBySymbolByIdHashmap['ETH/USDT'] !== undefined);
    assert (arrayCacheBySymbolByIdHashmap['ETH/USDT']['order2'] !== undefined);
    const arrayCacheBySymbolByIdData = exchange.safeValue (arrayCacheBySymbolById, 'Data');
    const cacheBySymbolByIdData = arrayCacheBySymbolByIdData !== undefined ? arrayCacheBySymbolByIdData : arrayCacheBySymbolById;
    assert (cacheBySymbolByIdData.length > 0);

    // Test cache types - ArrayCacheBySymbolBySide
    const arrayCacheBySymbolBySide = new ArrayCacheBySymbolBySide ();
    arrayCacheBySymbolBySide.append ({ 'symbol': 'BNB/USDT', 'side': 'buy', 'price': 400 });
    // Use direct property access for object attributes
    const arrayCacheBySymbolBySideHashmap = arrayCacheBySymbolBySide.hashmap;
    assert (arrayCacheBySymbolBySideHashmap['BNB/USDT'] !== undefined);
    const arrayCacheBySymbolBySideData = exchange.safeValue (arrayCacheBySymbolBySide, 'Data');
    const cacheBySymbolBySideData = arrayCacheBySymbolBySideData !== undefined ? arrayCacheBySymbolBySideData : arrayCacheBySymbolBySide;
    assert (cacheBySymbolBySideData.length > 0);

    // Test map[string]map[string]interface{} (ArrayCache.hashmap)
    // Use direct property access for object attributes
    const arrayCacheHashmapDirect = arrayCache.hashmap;
    const nestedMap = arrayCacheHashmapDirect;
    assert (exchange.safeValue (nestedMap, 'NONEXISTENT') === undefined);
    // Test map[string]*ArrayCache (Trades structure)
    const tradesMap = {
        'BTC/USDT': arrayCache,
        'ETH/USDT': arrayCacheBySymbolById,
    };
    const stored = exchange.safeValue (tradesMap, 'BTC/USDT');
    assert (stored !== undefined);
    // Use direct property access for hashmap (object attribute)
    const retrievedArrayCacheHashmap = stored.hashmap;
    assert (retrievedArrayCacheHashmap !== undefined);
    const retrievedArrayCacheBySymbolById = exchange.safeValue (tradesMap, 'ETH/USDT');
    assert (retrievedArrayCacheBySymbolById !== undefined);
    // Use direct property access for hashmap (object attribute)
    const retrievedArrayCacheBySymbolByIdHashmap = retrievedArrayCacheBySymbolById.hashmap;
    assert (retrievedArrayCacheBySymbolByIdHashmap !== undefined);
    assert (exchange.safeValue (tradesMap, 'NONEXISTENT') === undefined);

    // Test map[string]*ArrayCacheByTimestamp (Ohlcvs inner structure)
    const ohlcvInnerMap = {
        '1m': arrayCacheByTimestamp,
        '5m': new ArrayCacheByTimestamp (100),
    };
    const retrievedArrayCacheByTimestamp = exchange.safeValue (ohlcvInnerMap, '1m');
    assert (retrievedArrayCacheByTimestamp !== undefined);
    // Use direct property access for object attributes
    const retrievedArrayCacheByTimestampHashmap = retrievedArrayCacheByTimestamp.hashmap;
    assert (retrievedArrayCacheByTimestampHashmap !== undefined);
    assert (exchange.safeValue (ohlcvInnerMap, '5m') !== undefined);
    assert (exchange.safeValue (ohlcvInnerMap, 'NONEXISTENT') === undefined);

    // Test map[string]*ArrayCacheBySymbolBySide
    const cacheBySideMap = {
        'BTC/USDT': arrayCacheBySymbolBySide,
    };
    const retrievedArrayCacheBySymbolBySide = exchange.safeValue (cacheBySideMap, 'BTC/USDT');
    assert (retrievedArrayCacheBySymbolBySide !== undefined);
    const retrievedArrayCacheBySymbolBySideHashmap = retrievedArrayCacheBySymbolBySide.hashmap;
    assert (retrievedArrayCacheBySymbolBySideHashmap !== undefined);
    assert (exchange.safeValue (cacheBySideMap, 'NONEXISTENT') === undefined);
}

export default testSafeMethods;
