
// AUTO_TRANSPILE_ENABLED

import assert from 'assert';
import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';

function testExtend () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    const obj1 = {
        "a": 1,
        "b": [ 1, 2 ],
        "c": [ { "test1": 1, "test2": 1 } ],
        "d": undefined,
        "e": "not_undefined",
        "sub": {
            "a": 1,
            "b": [ 1, 2 ],
            "c": [ { "test1": 1, "test2": 2 } ],
            "d": undefined,
            "e": "not_undefined",
            "other1": "x",
        },
        "other1": "x",
    };

    const obj2 = {
        "a": 2,
        "b": [ 3, 4 ],
        "c": [ { "test1": 2, "test3": 3 } ],
        "d": "not_undefined",
        "e": undefined,
        "sub": {
            "a": 2,
            "b": [ 3, 4 ],
            "c": [ { "test1": 2, "test3": 3 } ],
            "d": "not_undefined",
            "e": undefined,
            "other2": "y",
        },
        "other2": "y",
    };

    // extend
    const extended = exchange.extend (obj1, obj2);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testExtend', extended, {
        "a": 2,
        "b": [ 3, 4 ],
        "c": [ {
            "test1": 2,
            "test3": 3,
        } ],
        "d": "not_undefined",
        "sub": {
            "a": 2,
            "b": [ 3, 4 ],
            "c": [ {
                "test1": 2,
                "test3": 3,
            } ],
            "d": "not_undefined",
            "other2": "y",
        },
        "other1": "x",
        "other2": "y",
    });
    // deepExtend
    const deepExtended = exchange.deepExtend (obj1, obj2);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testExtend', deepExtended, {
        "a": 2,
        "b": [ 3, 4 ],
        "c": [ {
            "test1": 2,
            "test3": 3,
        } ],
        "d": "not_undefined",
        "sub": {
            "a": 2,
            "b": [ 3, 4 ],
            "c": [ { "test1": 2, "test3": 3 } ],
            "d": "not_undefined",
            "e": "not_undefined",
            "other1": "x",
            "other2": "y",
        },
        "other1": "x",
        "other2": "y",
    });
}

export default testExtend;
