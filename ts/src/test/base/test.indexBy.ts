// AUTO_TRANSPILE_ENABLED

import assert from 'assert';
import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';

function testIndexBy () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    // Test 1: Basic list of dicts with string key
    const input1 = [
        { 'id': 'a', 'val': 1 },
        { 'id': 'b', 'val': 2 },
        { 'id': 'c', 'val': 3 },
    ];
    const expected1 = {
        'a': { 'id': 'a', 'val': 1 },
        'b': { 'id': 'b', 'val': 2 },
        'c': { 'id': 'c', 'val': 3 },
    };
    const result1 = exchange.indexBy (input1, 'id');
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testIndexBy', result1, expected1);

    // Test 2: Skip elements with None/undefined values
    const input2 = [
        { 'id': 'a', 'val': 1 },
        { 'id': undefined, 'val': 2 },
        { 'id': 'b', 'val': 3 },
    ];
    const expected2 = {
        'a': { 'id': 'a', 'val': 1 },
        'b': { 'id': 'b', 'val': 3 },
    };
    const result2 = exchange.indexBy (input2, 'id');
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testIndexBy', result2, expected2);

    // Test 3: Skip elements missing the key
    const input3 = [
        { 'id': 'a', 'val': 1 },
        { 'val': 2 },
        { 'id': 'b', 'val': 3 },
    ];
    const expected3 = {
        'a': { 'id': 'a', 'val': 1 },
        'b': { 'id': 'b', 'val': 3 },
    };
    const result3 = exchange.indexBy (input3, 'id');
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testIndexBy', result3, expected3);

    // Test 4: Empty array
    const input4 = [];
    const expected4 = {};
    const result4 = exchange.indexBy (input4, 'id');
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testIndexBy', result4, expected4);

    // Test 5: Duplicate keys (last one wins)
    const input5 = [
        { 'id': 'a', 'val': 1 },
        { 'id': 'a', 'val': 2 },
        { 'id': 'a', 'val': 3 },
    ];
    const expected5 = {
        'a': { 'id': 'a', 'val': 3 },
    };
    const result5 = exchange.indexBy (input5, 'id');
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testIndexBy', result5, expected5);

    // Test 6: Numeric key values
    const input6 = [
        { 'code': 1, 'name': 'one' },
        { 'code': 2, 'name': 'two' },
        { 'code': 3, 'name': 'three' },
    ];
    const expected6 = {
        '1': { 'code': 1, 'name': 'one' },
        '2': { 'code': 2, 'name': 'two' },
        '3': { 'code': 3, 'name': 'three' },
    };
    const result6 = exchange.indexBy (input6, 'code');
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testIndexBy', result6, expected6);

    // Test 7: List of arrays with integer key
    const input7 = [
        [ 'a', 1 ],
        [ 'b', 2 ],
        [ 'c', 3 ],
    ];
    const expected7 = {
        'a': [ 'a', 1 ],
        'b': [ 'b', 2 ],
        'c': [ 'c', 3 ],
    };
    const result7 = exchange.indexBy (input7, 0);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testIndexBy', result7, expected7);

    // Test 8: Single element
    const input8 = [
        { 'id': 'only', 'val': 42 },
    ];
    const expected8 = {
        'only': { 'id': 'only', 'val': 42 },
    };
    const result8 = exchange.indexBy (input8, 'id');
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testIndexBy', result8, expected8);
}

export default testIndexBy;