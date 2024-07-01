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
        'a': 1,
        'bool': true,
        'list': [ 1, 2, 3 ],
        'dict': { 'a': 1 },
        'str': 'hello'
    };

    const inputList = [ "hi", 2 ];

    // safeValue
    assert (exchange.safeValue (inputDict, 'a') === 1);
    assert (exchange.safeValue (inputDict, 'bool') === true);
    assert (equals (exchange.safeValue (inputDict, 'list'), [ 1, 2, 3 ]));
    const dictObject = exchange.safeValue (inputDict, 'dict');
    assert (equals (dictObject, { 'a': 1 }));
    assert (exchange.safeValue (inputList, 0) === 'hi');

    // safeValue2
    assert (exchange.safeValue2 (inputDict, 'b', 'a') === 1);
    assert (exchange.safeValue2 (inputDict, 's', 'bool') === true);

    // safeString
    assert (exchange.safeString (inputDict, 'a') === '1');
    // assert (exchange.safeString (inputDict, 'bool') === 'true'); returns True in python and 'true' in js
    assert (exchange.safeString (inputList, 0) === 'hi');
    assert (exchange.safeString (inputDict, 'str') === 'hello');

    // safeInteger
    assert (exchange.safeInteger (inputDict, 'a') === 1);
    assert (exchange.safeInteger2 (inputDict, 'b', 'a') === 1);
}


export default testSafeMethods;
