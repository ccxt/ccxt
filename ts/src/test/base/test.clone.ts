import assert from 'assert';
import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';

function testClone () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    // Test 1: Clone a simple object and ensure no mutation
    const original = {
        "a": 1,
        "b": [ 1, 2, 3 ],
        "c": { "nested": "value" },
    };

    const cloned = exchange.clone (original);

    // Verify initial equality
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testClone - initial equality', cloned, original);

    // Mutate the cloned object
    cloned['a'] = 999;
    cloned['b'].push (4);
    cloned['c']['nested'] = "modified";

    // Verify original was not mutated
    assert (original['a'] === 1, 'Original primitive value should not be mutated');
    assert (original['b'].length === 3, 'Original array length should not change');
    assert (original['c']['nested'] === "value", 'Original nested object should not be mutated');

    // Verify cloned object has the mutations
    assert (cloned['a'] === 999, 'Cloned primitive value should be mutated');
    assert (cloned['b'].length === 4, 'Cloned array should have new element');
    assert (cloned['c']['nested'] === "modified", 'Cloned nested object should be mutated');

    // Test 2: Clone with nested objects and arrays
    const complexOriginal = {
        "id": "test",
        "markets": {
            "BTC/USDT": {
                "symbol": "BTC/USDT",
                "limits": { "amount": { "min": 0.001 }},
            },
        },
        "currencies": [ "BTC", "USDT", "ETH" ],
        "options": {
            "defaultType": "spot",
            "settings": {
                "timeout": 10000,
            },
        },
    };

    const complexCloned = exchange.clone (complexOriginal);

    // Mutate deeply nested values in the clone
    complexCloned['markets']["BTC/USDT"]['limits']['amount']['min'] = 0.01;
    complexCloned['currencies'].push ("XRP");
    complexCloned['options']['settings']['timeout'] = 20000;
    complexCloned['options']['newField'] = "added";

    // Verify original was not affected
    assert (complexOriginal['markets']["BTC/USDT"]['limits']['amount']['min'] === 0.001, 'Original nested limit should not be mutated');
    assert (complexOriginal['currencies'].length === 3, 'Original currencies array should not be mutated');
    assert (complexOriginal['options']['settings']['timeout'] === 10000, 'Original nested timeout should not be mutated');
    assert (complexOriginal['options']['newField'] === undefined, 'Original should not have new field');

    // Verify clone has the mutations
    assert (complexCloned['markets']["BTC/USDT"]['limits']['amount']['min'] === 0.01, 'Cloned nested limit should be mutated');
    assert (complexCloned['currencies'].length === 4, 'Cloned currencies array should have new element');
    assert (complexCloned['options']['settings']['timeout'] === 20000, 'Cloned nested timeout should be mutated');
    assert (complexCloned['options']['newField'] === "added", 'Cloned should have new field');

    // Test 3: Clone with undefined and null values
    const withSpecialValues = {
        "a": undefined,
        "b": null,
        "c": { "nested": undefined },
        "d": [ null, undefined, 1 ],
    };

    const specialCloned = exchange.clone (withSpecialValues);

    // Verify special values are preserved
    assert (specialCloned['a'] === undefined, 'Cloned undefined should remain undefined');
    assert (specialCloned['b'] === null, 'Cloned null should remain null');
    assert (specialCloned['c']['nested'] === undefined, 'Cloned nested undefined should remain undefined');
    assert (specialCloned['d'][0] === null, 'Cloned array null should remain null');
    assert (specialCloned['d'][1] === undefined, 'Cloned array undefined should remain undefined');

    // Mutate and verify no cross-contamination
    specialCloned['d'].push (2);
    assert (withSpecialValues['d'].length === 3, 'Original array with special values should not be mutated');
    assert (specialCloned['d'].length === 4, 'Cloned array with special values should be mutated');
}

export default testClone;

