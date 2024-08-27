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
    } else if (arrayALength === 0) {
        return true;
    }
    for (let i = 0; i < arrayALength; i++) {
        const key = aKeys[i];
        if ((a[key] !== b[key]) && (!deepEquals (a[key], b[key]))) {
            return false;
        }
    }
    return true;
}

function uniqueArraysHaveSameEntries (a, b) {
    const aLength = a.length;
    const bLength = b.length;
    if (aLength !== bLength) {
        return false;
    }
    for (let i = 0; i < aLength; i++) {
        const entry = a[i];
        let found = false;
        for (let j = 0; j < bLength; j++) {
            if (b[j] === entry) {
                found = true;
                break;
            }
        }
        if (found === false) {
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
    const sortedKeys = [ 'bool', 'dict', 'f', 'i', 'list', 'str', 'strNumber' ];
    const inputDictValues = [ 1, 0.123, true, [ 1, 2, 3 ], { 'a': 1, 'b': '2' }, 'heLlo', '3' ];

    const inputList = [ 'Hi', 2, 2 ];
    const inputListKeys = [ '0', '1', '2' ]; // todo check if it is good
    const inputListValues = [ 'Hi', 2, 2 ];
    const uniqueList = [ 'Hi', 2 ];
    const concatenatedList = [ 'Hi', 2, 2, 'Hi', 2, 2 ];

    const inputDict2 = {
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

    // keys no such property in py and php
    // assert (deepEquals (exchange.keys (inputDict), inputDictKeys));
    // assert (deepEquals (exchange.keys (inputList), inputListKeys));

    // values no such property in py and php
    // assert (deepEquals (exchange.values (inputDict), inputDictValues));
    // assert (deepEquals (exchange.values (inputList), inputListValues));

    // flatten no such property in py
    // const flattenList = [ 1, 2, 3, 4, 5, 6 ];
    // const flattenResult = exchange.flatten ([ 1, [ 2, 3, [ 4, 5, [ 6 ] ] ] ]);
    // assert (equals (flattenList, flattenResult));

    // ordered can not be checked in ts

    // merge no such property in py
    // const mergeResult = exchange.merge (inputDict, inputDict2);
    // const mergeDict = {
    //     'i': 1,
    //     'f': 0.123,
    //     'bool': true,
    //     'list': [ 1, 2, 3 ],
    //     'dict': { 'a': 1, 'b': '2' },
    //     'str': 'heLlo',
    //     'strNumber': '3',
    //     'a': 1,
    // };
    // assert (deepEquals (mergeDict, mergeResult));

    // extend
    assert (deepEquals (exchange.extend (inputDict2, inputDict), extendedDict));

    // deepExtend
    assert (deepEquals (exchange.deepExtend (inputDict2, inputDict), deepExtendedDict));

    // clone
    assert (deepEquals (exchange.clone (inputDict), inputDict));
    assert (deepEquals (exchange.clone (inputList), inputList));

    // unique the order of the elements in array is changing in py
    assert (uniqueArraysHaveSameEntries (exchange.unique (inputList), uniqueList));

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

    // keysort
    const sortedDict = exchange.keysort (inputDict);
    assert (deepEquals (Object.keys (sortedDict), sortedKeys));

    // indexBy
    const indexedDict = {
        'heLlo': inputDict,
        'hi': inputDict2,
    };
    let indexedResult = exchange.indexBy ([ inputDict, inputDict2 ], 'str');
    assert (deepEquals (indexedDict, indexedResult));
    const inputDict3 = {
        'inputDict': inputDict,
        'inputDict2': inputDict2,
    };
    indexedResult = exchange.indexBy (inputDict3, 'str');
    assert (deepEquals (indexedDict, indexedResult));

    // groupBy
    const groupedDict = {
        'heLlo': [ inputDict, deepExtendedDict ],
        'hi': [ inputDict2 ],
    };
    let groupedResult = exchange.groupBy ([ inputDict,  inputDict2, deepExtendedDict ], 'str');
    assert (deepEquals (groupedDict, groupedResult));
    const inputDict4 = {
        'inputDict': inputDict,
        'inputDict2': inputDict2,
        'deepExtendedDict': deepExtendedDict,
    };
    groupedResult = exchange.groupBy (inputDict4, 'str');
    assert (deepEquals (groupedDict, groupedResult));

    // filterBy
    const filtered = [ inputDict, deepExtendedDict ];
    let filteredResult = exchange.filterBy ([ inputDict,  inputDict2, deepExtendedDict ], 'str', 'heLlo');
    assert (deepEquals (filtered, filteredResult));
    filteredResult = exchange.filterBy (inputDict4, 'str', 'heLlo');
    assert (deepEquals (filtered, filteredResult));

    // sortBy
    const sortedBy = [ inputDict, deepExtendedDict, inputDict2 ];
    const sortedResult = exchange.sortBy ([ inputDict,  inputDict2, deepExtendedDict ], 'i');
    assert (deepEquals (sortedBy, sortedResult));

    // sortBy2
    const inputDict5 = {
        'i': 1,
        'strNumber': '1',
    };
    const sortedBy2 = [ inputDict5, inputDict, inputDict2 ];
    const sortedBy2Result = exchange.sortBy2 ([ inputDict,  inputDict2, inputDict5 ], 'i', 'strNumber');
    assert (deepEquals (sortedBy2, sortedBy2Result));

    // pluck
    const pluckList = [ 'heLlo', 'hi', 'heLlo' ];
    const pluckResult = exchange.pluck ([ inputDict, inputDict2, extendedDict ], 'str');
    assert (deepEquals (pluckList, pluckResult));

    // omit
    assert (deepEquals ((exchange.omit ({}, 'foo')), {}));
    assert (deepEquals ((exchange.omit ({ 'foo': 2 }, 'foo')), {}));
    assert (deepEquals ((exchange.omit ({ 'foo': 2, 'bar': 3 }, 'foo')), { 'bar': 3 }));
    assert (deepEquals ((exchange.omit ({ 'foo': 2, 'bar': 3 }, [ 'foo' ])), { 'bar': 3 }));
    assert (deepEquals ((exchange.omit ({ 'foo': 2, 'bar': 3 }, [ 'foo', 'bar' ])), {}));
    // assert (deepEquals ((exchange.omit ({ 'foo': 2, 'bar': 3 })), { 'foo': 2, 'bar': 3 })); two arguments required in php
    // assert (deepEquals ((exchange.omit ({ 'foo': 2, 'bar': 3 }, 'foo', 'bar')), {})); AssertionError in php
    // assert (deepEquals ((exchange.omit ({ 'foo': 2, 'bar': 3 }, [ 'foo' ], 'bar')), {})); AssertionError in php
    assert (deepEquals ((exchange.omit ({ '5': 2, 'bar': 3 }, [ '5' ])), { 'bar': 3 }));
    assert (deepEquals ((exchange.omit ({ '5': 2, 'bar': 3 }, '5')), { 'bar': 3 }));

    // sum
    // assert (exchange.sum () === undefined); 0 in py
    assert (exchange.sum (2) === 2);
    assert (exchange.sum (2, 30, 400) === 432);
    assert (exchange.sum (2, undefined, [ 88 ], 30, 400, null) === 432);
    // assert (exchange.sum (2, undefined, [ 88 ], 30, '7', 400, null) === 432); AssertionError in php (result is 439)
}

export default testGenericMethods;
