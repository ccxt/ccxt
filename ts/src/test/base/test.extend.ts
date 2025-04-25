
// AUTO_TRANSPILE_ENABLED

import assert from 'assert';
import ccxt from '../../../ccxt.js';
import Exchange from '../../abstract/ace.js';

function testExtend () {

    const exchange = new ccxt.Exchange ({
        'id': 'example',
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
    tbfeCheckExtended (extended, true);
    // deepExtend
    // const deepExtended = exchange.deepExtend (obj1, obj2);
    // tbfeCheckExtended (extended, true);
    // todo !
    // tbfeCheckExtended (deepExtended["sub"], false);
    assert ('GO_SKIP_START');
    testMutation ();
    testMutationComplex ();
    assert ('GO_SKIP_END');
}

function testMutation () {
    // extend should not mutate the initial dicts
    const exchange = new ccxt.Exchange ({
        'id': 'example',
    });
    const first = {
        'a': 1
    };
    const second = {
        'b': 2
    };
    const merged = exchange.extend (first, second);

    const firstKeys = Object.keys (first);
    assert (firstKeys.length === 1);
    assert (firstKeys[0] === 'a');

    const secondKeys = Object.keys (second);
    assert (secondKeys.length === 1);
    assert (secondKeys[0] === 'b');

    const mergedKeys = Object.keys (merged);
    assert (mergedKeys.length === 2);
    assert ('a' in merged);
    assert ('b' in merged);
}


function testMutationComplex () {
    // extend should not mutate the initial dicts
    const exchange = new ccxt.Exchange ({
        'id': 'example',
    });
    const first = {
        'info': {
            'a': 1
        }
    };
    const second = {
        'b': 2
    };
    const merged = exchange.extend (first, second);

    merged["info"]["a"] = 2;
    assert (first["info"]["a"] === 1);
}

function tbfeCheckExtended (extended: any, hasSub: boolean) {
    assert (extended["a"] === 2);
    assert (extended["b"][0] === 3);
    assert (extended["b"][1] === 4);
    assert (extended["c"][0]["test1"] === 2);
    assert (!("test2" in extended["c"][0]));
    assert (extended["c"][0]["test3"] === 3);
    assert (extended["d"] === "not_undefined");
    assert (extended["e"] === undefined);
    assert (extended["other1"] === "x");
    assert (extended["other2"] === "y");
    if (hasSub) {
        assert ("sub" in extended);
    }
}

export default testExtend;
