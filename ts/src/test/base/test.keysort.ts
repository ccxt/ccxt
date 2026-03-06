// AUTO_TRANSPILE_ENABLED

import assert from 'assert';
import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';

function testKeysort () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    assert ('GO_SKIP_START');
    // Test 1: Basic key sorting
    const unsortedDict1 = {
        'c': 3,
        'a': 1,
        'b': 2,
    };
    const expectedSorted1 = {
        'a': 1,
        'b': 2,
        'c': 3,
    };
    const result1 = exchange.keysort (unsortedDict1);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testKeysort', Object.keys (result1), Object.keys (expectedSorted1));

    // Test 2: Already sorted dictionary
    const unsortedDict2 = {
        'alpha': 'first',
        'beta': 'second',
        'gamma': 'third',
    };
    const expectedSorted2 = {
        'alpha': 'first',
        'beta': 'second',
        'gamma': 'third',
    };
    const result2 = exchange.keysort (unsortedDict2);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testKeysort', Object.keys (result2), Object.keys (expectedSorted2));

    // Test 3: Reverse sorted input
    const unsortedDict3 = {
        'z': 'last',
        'n': 'middle',
        'a': 'first',
    };
    const expectedSorted3 = {
        'a': 'first',
        'n': 'middle',
        'z': 'last',
    };
    const result3 = exchange.keysort (unsortedDict3);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testKeysort', Object.keys (result3), Object.keys (expectedSorted3));

    // Test 4: Empty dictionary
    const unsortedDict4 = {};
    const expectedSorted4 = {};
    const result4 = exchange.keysort (unsortedDict4);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testKeysort', Object.keys (result4), Object.keys (expectedSorted4));

    // Test 5: Single key dictionary
    const unsortedDict5 = {
        'only': 'one',
    };
    const expectedSorted5 = {
        'only': 'one',
    };
    const result5 = exchange.keysort (unsortedDict5);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testKeysort', Object.keys (result5), Object.keys (expectedSorted5));

    // Test 6: Numeric string keys
    const unsortedDict6 = {
        '10': 'ten',
        '2': 'two',
        '1': 'one',
    };
    const expectedSorted6 = {
        '1': 'one',
        '10': 'ten',
        '2': 'two',
    };
    const result6 = exchange.keysort (unsortedDict6);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testKeysort', Object.keys (result6), Object.keys (expectedSorted6));

    // Test 7: Mixed case keys (lexicographic sort)
    const unsortedDict7 = {
        'Banana': 1,
        'apple': 2,
        'Cherry': 3,
    };
    const expectedSorted7 = {
        'Banana': 1,
        'Cherry': 3,
        'apple': 2,
    };
    const result7 = exchange.keysort (unsortedDict7);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testKeysort', Object.keys (result7), Object.keys (expectedSorted7));
    assert ('GO_SKIP_END');
    assert (exchange.safeString (undefined, 'placeholder') === undefined); // go trick
}

export default testKeysort;
