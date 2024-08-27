// @ts-nocheck
// AUTO_TRANSPILE_ENABLED

import assert from 'assert';
import ccxt from '../../../ccxt.js';
import { isObject } from '../../base/functions.js';

function deepEquals (a, b) {
    const aKeys = Object.keys (a);
    const bKeys = Object.keys (b);
    const arrayALength = aKeys.length;
    const arrayBLength = bKeys.length;
    if (arrayALength !== arrayBLength) {
        return false;
    }
    for (let i = 0; i < arrayALength; i++) {
        const key = aKeys[i];
        if (isObject (a[key])) {
            if (isObject (b[key])) {
                return false;
            } else if (!deepEquals (a[key], b[key])) {
                return false;
            }
        } else if (a[key] !== b[key]) {
            return false;
        }
    }
    return true;
}

function testGenericMethods () {

    const exchange = new ccxt.Exchange ({
        'id': 'regirock',
    });

    const inputDict = {
        'i': 1,
        'f': 0.123,
        'bool': true,
        'list': [ 1, 2, 3 ],
        'dict': { 'a': 1, 'b': '2' },
        'str': 'heLlo',
        'strNumber': '3',
    };
    const inputDictKeys = Object.keys (inputDict);
    const inputDictValues = Object.values (inputDict);

    const inputList = [ 'Hi', 2 ];
    const inputListKeys = [ '0', '1' ]; // todo check if it is good
    const inputListValues = [ 'Hi', 2 ];

    const extendingDict = {
        'a': 1,
        'i': 100,
        'f': 100.0,
        'bool': false,
        'list': [ 1, 2, 3, 4 ],
        'dict': { 'a': 'a', 'c': 3 },
        'str': 'hi',
        'strNumber': '100',
    };

    const extendedDict = {
        'a': 1,
        'i': 1,
        'f': 0.123,
        'bool': true,
        'list': [ 1, 2, 3 ],
        'dict': { 'a': 1, 'b': '2' },
        'str': 'heLlo',
        'strNumber': '3',
    };

    const deepExtendedDict = {
        'a': 1,
        'i': 1,
        'f': 0.123,
        'bool': true,
        'list': [ 1, 2, 3 ],
        'dict': { 'a': 1, 'b': '2', 'c': 3 },
        'str': 'heLlo',
        'strNumber': '3',
    };

    // keys
    assert (deepEquals (exchange.keys (inputDict), inputDictKeys));
    assert (deepEquals (exchange.keys (inputList), inputListKeys));

    // values
    assert (deepEquals (exchange.values (inputDict), inputDictValues));
    assert (deepEquals (exchange.values (inputList), inputListValues));

    // extend
    assert (deepEquals (exchange.extend (extendingDict, inputDict), extendedDict));

    // deepExtend
    assert (deepEquals (exchange.deepExtend (extendingDict, inputDict), deepExtendedDict));

    // clone
    assert (deepEquals (exchange.clone (inputDict), inputDict));
    assert (deepEquals (exchange.clone (inputList), inputList));
}

export default testGenericMethods;
