// @ts-nocheck
// AUTO_TRANSPILE_ENABLED

import assert from 'assert';
import ccxt from '../../../ccxt.js';

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
        'str': 'heLlo',
        'strNumber': '3',
    };

    const inputList = [ 'Hi', 2 ];

    const factor = 10;

    // safeValue
    assert (exchange.safeValue (inputDict, 'i') === 1);
    assert (exchange.safeValue (inputDict, 'f') === 0.123);
    assert (exchange.safeValue (inputDict, 'bool') === true);
    assert (equals (exchange.safeValue (inputDict, 'list'), [ 1, 2, 3 ]));
    let dictObject = exchange.safeValue (inputDict, 'dict');
    assert (equals (dictObject, { 'a': 1 }));
    assert (exchange.safeValue (inputDict, 'str') === 'heLlo');
    assert (exchange.safeValue (inputDict, 'strNumber') === '3');
    assert (exchange.safeValue (inputList, 0) === 'Hi');

    // safeValue2
    assert (exchange.safeValue2 (inputDict, 'a', 'i') === 1);
    assert (exchange.safeValue2 (inputDict, 'a', 'f') === 0.123);
    assert (exchange.safeValue2 (inputDict, 'a', 'bool') === true);
    assert (equals (exchange.safeValue2 (inputDict, 'a', 'list'), [ 1, 2, 3 ]));
    dictObject = exchange.safeValue2 (inputDict, 'a', 'dict');
    assert (equals (dictObject, { 'a': 1 }));
    assert (exchange.safeValue2 (inputDict, 'a', 'str') === 'heLlo');
    assert (exchange.safeValue2 (inputDict, 'a', 'strNumber') === '3');
    assert (exchange.safeValue2 (inputList, 3, 0) === 'Hi');

    // safeValueN
    assert (exchange.safeValueN (inputDict, [ 'a', 'b', 'i' ]) === 1);
    assert (exchange.safeValueN (inputDict, [ 'a', 'b', 'f' ]) === 0.123);
    assert (exchange.safeValueN (inputDict, [ 'a', 'b', 'bool' ]) === true);
    assert (equals (exchange.safeValueN (inputDict, [ 'a', 'b', 'list' ]), [ 1, 2, 3 ]));
    dictObject = exchange.safeValueN (inputDict, [ 'a', 'b', 'dict' ]);
    assert (equals (dictObject, { 'a': 1 }));
    assert (exchange.safeValueN (inputDict, [ 'a', 'b', 'str' ]) === 'heLlo');
    assert (exchange.safeValueN (inputDict, [ 'a', 'b', 'strNumber' ]) === '3');
    assert (exchange.safeValueN (inputList, [ 3, 2, 0 ]) === 'Hi');

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
    assert (exchange.safeString2 (inputList, 3, 0) === 'Hi');

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
    assert (exchange.safeStringLower2 (inputList, 3, 0) === 'hi');

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
    assert (exchange.safeStringUpper2 (inputList, 3, 0) === 'HI');

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
    assert (exchange.safeInteger2 (inputList, 3, 1) === 2);

    // safeIntegerN
    assert (exchange.safeIntegerN (inputDict, [ 'a', 'b', 'i' ]) === 1);
    assert (exchange.safeIntegerN (inputDict, [ 'a', 'b', 'f' ]) === 0);
    assert (exchange.safeIntegerN (inputDict, [ 'a', 'b', 'strNumber' ]) === 3);
    assert (exchange.safeIntegerN (inputList, [ 3, 2, 1 ]) === 2);

    // safeIntegerProduct
    assert (exchange.safeIntegerProduct (inputDict, 'i', factor) === 10);
    assert (exchange.safeIntegerProduct (inputDict, 'f', factor) === 1); // NB the result is 1
    assert (exchange.safeIntegerProduct (inputDict, 'strNumber', factor) === 30);
    assert (exchange.safeIntegerProduct (inputList, 1, factor) === 20);

    // safeIntegerProduct2
    assert (exchange.safeIntegerProduct2 (inputDict, 'a', 'i', factor) === 10);
    assert (exchange.safeIntegerProduct2 (inputDict, 'a', 'f', factor) === 0); // safeIntegerProduct uses asFloat for the sought-for value, but safeIntegerProduct2 uses asInteger
    assert (exchange.safeIntegerProduct2 (inputDict, 'a', 'strNumber', factor) === 30);
    assert (exchange.safeIntegerProduct2 (inputList, 3, 1, factor) === 20);

    // safeIntegerProductN
    assert (exchange.safeIntegerProductN (inputDict, [ 'a', 'b', 'i' ], factor) === 10);
    assert (exchange.safeIntegerProductN (inputDict, [ 'a', 'b', 'f' ], factor) === 0); // safeIntegerProduct uses asFloat for the sought-for value, but safeIntegerProductN uses asInteger
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
    assert (exchange.safeFloat (inputDict, 'i') === 1);
    assert (exchange.safeFloat (inputDict, 'f') === 0.123);
    assert (exchange.safeFloat (inputDict, 'strNumber') === 3);
    assert (exchange.safeFloat (inputList, 1) === 2);

    // safeFloat2
    assert (exchange.safeFloat2 (inputDict, 'a', 'i') === 1);
    assert (exchange.safeFloat2 (inputDict, 'a', 'f') === 0.123);
    assert (exchange.safeFloat2 (inputDict, 'a', 'strNumber') === 3);
    assert (exchange.safeFloat2 (inputList, 3, 1) === 2);

    // safeFloatN
    assert (exchange.safeFloatN (inputDict, [ 'a', 'b', 'i' ]) === 1);
    assert (exchange.safeFloatN (inputDict, [ 'a', 'b', 'f' ]) === 0.123);
    assert (exchange.safeFloatN (inputDict, [ 'a', 'b', 'strNumber' ]) === 3);
    assert (exchange.safeFloatN (inputList, [ 3, 2, 1 ]) === 2);
}


export default testSafeMethods;
