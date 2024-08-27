// @ts-nocheck
// AUTO_TRANSPILE_ENABLED

import assert from 'assert';
import ccxt from '../../../ccxt.js';

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
        if (ccxt.isObject (a[key])) {
            if (!ccxt.isObject (b[key])) {
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
    // keys
    assert (deepEquals (exchange.keys (inputDict), inputDictKeys));
    assert (deepEquals (exchange.keys (inputList), inputListKeys));

    // values
    assert (deepEquals (exchange.values (inputDict), inputDictValues));
    assert (deepEquals (exchange.values (inputList), inputListValues));
}

export default testGenericMethods;
