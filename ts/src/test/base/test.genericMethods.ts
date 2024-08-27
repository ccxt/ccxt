// @ts-nocheck
// AUTO_TRANSPILE_ENABLED

import assert from 'assert';
import ccxt from '../../../ccxt.js';

function deepEquals (a, b) {
    let aKeys = [];
    let bKeys = [];
    try {
        aKeys = Object.keys (a);
        bKeys = Object.keys (b);
    } catch (e) {
        return a === b;
    }
    const arrayALength = aKeys.length;
    const arrayBLength = bKeys.length;
    if (arrayALength !== arrayBLength) {
        return false;
    }
    for (let i = 0; i < arrayALength; i++) {
        const key = aKeys[i];
        if ((a[key] !== b[key]) && (!deepEquals (a[key], b[key]))) {
            return false;
        }
    }
    return true;
}

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
    const inputDictKeys = [ 'i', 'f', 'bool', 'list', 'dict', 'str', 'strNumber' ];
    const inputDictValues = [ 1, 0.123, true, [ 1, 2, 3 ], { 'a': 1, 'b': '2' }, 'heLlo', '3' ];

    const inputList = [ 'Hi', 2, 2 ];
    const inputListKeys = [ '0', '1', '2' ]; // todo check if it is good
    const inputListValues = [ 'Hi', 2, 2 ];
    const uniqueList = [ 'Hi', 2 ];
    const concatenatedList = [ 'Hi', 2, 2, 'Hi', 2, 2 ];

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

    // keys no such property in python and php
    // assert (deepEquals (exchange.keys (inputDict), inputDictKeys));
    // assert (deepEquals (exchange.keys (inputList), inputListKeys));

    // values no such property in python and php
    // assert (deepEquals (exchange.values (inputDict), inputDictValues));
    // assert (deepEquals (exchange.values (inputList), inputListValues));

    // extend
    assert (deepEquals (exchange.extend (extendingDict, inputDict), extendedDict));

    // deepExtend
    assert (deepEquals (exchange.deepExtend (extendingDict, inputDict), deepExtendedDict));

    // clone
    assert (deepEquals (exchange.clone (inputDict), inputDict));
    assert (deepEquals (exchange.clone (inputList), inputList));

    // unique the order of the elements in array is changing in py
    // assert (deepEquals (exchange.unique (inputList), uniqueList));

    // arrayConcat
    assert (deepEquals (exchange.arrayConcat (inputList, inputList), concatenatedList));

    // inArray
    assert (exchange.inArray ('Hi', inputList) === true);
    assert (exchange.inArray (3, inputList) === false);

    // toArray
    assert (deepEquals (exchange.toArray (inputDict), inputDictValues));

    // isEmpty
    assert (exchange.isEmpty ({}) === true);
    assert (exchange.isEmpty ([]) === true);
    assert (exchange.isEmpty (inputDict) === false);
    assert (exchange.isEmpty (inputList) === false);
}

export default testGenericMethods;
