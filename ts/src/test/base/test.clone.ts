

import assert from 'assert';
import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';

function helperTestCloneImmutability () {
    // todo: sandbox for real exchanges
    const opts = {
        'id': 'sampleexchange',
        'options': {
            'sandbox': false,
        },
        'urls': {
            'api': {
                'public': 'https://example.com'
            },
            'test': {
                'public': 'https://testnet.org'
            },
        }
    };
    // setSandbox uses clone, so we can reuse it
    const exchange3 = new ccxt.Exchange (opts);
    exchange3.setSandboxMode (true);
    //
    opts['options']['sandbox'] = true;
    const exchange4 = new ccxt.Exchange (opts);
    assert (exchange4.urls['api']['public'] === 'https://testnet.org');
    assert (exchange4.urls['apiBackup']['public'] === 'https://example.com');
    assert (exchange4.urls['test']['public'] === 'https://testnet.org');
    exchange4.setSandboxMode (false);
    assert (exchange4.urls['api']['public'] === 'https://example.com');
    assert (exchange4.urls['apiBackup']['public'] === 'https://example.com');
    assert (exchange4.urls['test']['public'] === 'https://testnet.org');
}

function testClone () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    const obj1 = {
        "a": 1,
        "b": [ 1, 2, 3 ],
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

    // deepExtend
    const deepExtended = exchange.deepExtend (obj1, obj2);
    const compareTo = {
        "a": 2,
        "b": [ 3, 4 ],
        "c": [ {
            "test1": 2,
            "test3": 3,
        } ],
        "d": "not_undefined",
        "e": undefined,
        "sub": {
            "a": 2,
            "b": [ 3, 4 ],
            "c": [ { "test1": 2, "test3": 3 } ],
            "d": "not_undefined",
            "e": undefined,
            "other1": "x",
            "other2": "y",
        },
        "other1": "x",
        "other2": "y",
    };
    // todo: results are different across langs.
    // to avoid delay to this PR, I comment out this now, but will return to this after this PR merged
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testDeepExtend', deepExtended, compareTo);

    // test immutability
    helperTestCloneImmutability ();
}

export default testClone;
